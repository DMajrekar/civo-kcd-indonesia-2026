package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"log"
	"sort"
	"strconv"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

type Item struct {
	ID    string `json:"id"`
	Text  string `json:"text"`
	Votes int64  `json:"votes"`
}

type Store interface {
	Name() string
	Seed(items []string)
	List(ctx context.Context) ([]Item, error)
	Vote(ctx context.Context, id string) (int64, error)
	Add(ctx context.Context, text string) (Item, error)
}

const maxItems = 60

var defaultItems = []string{
	"Kota Tua (old town) and a coffee at Café Batavia",
	"Monas, the National Monument",
	"Istiqlal Mosque and the Cathedral across the road",
	"Street food crawl: sate, nasi goreng, martabak",
	"Boat to the Thousand Islands (Pulau Seribu)",
	"Jalan Surabaya antique market",
	"Taman Mini Indonesia Indah",
	"Ancol beach and Dufan",
	"Indonesian coffee crawl: kopi tubruk, kopi susu",
	"Museum Nasional",
	"Bogor Botanical Gardens day trip",
	"Sunset at a rooftop bar in SCBD",
}

func newID() string {
	b := make([]byte, 5)
	rand.Read(b)
	return hex.EncodeToString(b)
}

// newStore returns a Valkey/Redis-backed store when REDIS_ADDR is set and
// answers within two seconds, otherwise an in-memory one. Falling back keeps
// the demo alive if the database is not there; it is logged loudly.
func newStore(addr string) Store {
	if addr == "" {
		log.Printf("REDIS_ADDR not set: using in-memory store (votes are per pod)")
		return newMemStore()
	}
	c := redis.NewClient(&redis.Options{Addr: addr, DialTimeout: 2 * time.Second, ReadTimeout: 2 * time.Second})
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	if err := c.Ping(ctx).Err(); err != nil {
		log.Printf("WARNING: cannot reach %s (%v): using in-memory store", addr, err)
		return newMemStore()
	}
	log.Printf("connected to valkey at %s", addr)
	return &redisStore{c: c}
}

// ----------------------------------------------------------------- redis

type redisStore struct{ c *redis.Client }

const (
	keyVotes = "jakarta:votes" // ZSET id -> votes
	keyText  = "jakarta:text"  // HASH id -> text
	keySeed  = "jakarta:seeded"
)

func (s *redisStore) Name() string { return "valkey" }

func (s *redisStore) Seed(items []string) {
	ctx := context.Background()
	ok, err := s.c.SetNX(ctx, keySeed, "1", 0).Result()
	if err != nil || !ok {
		return
	}
	for _, t := range items {
		id := newID()
		s.c.HSet(ctx, keyText, id, t)
		s.c.ZAdd(ctx, keyVotes, redis.Z{Score: 0, Member: id})
	}
	log.Printf("seeded %d items", len(items))
}

func (s *redisStore) List(ctx context.Context) ([]Item, error) {
	zs, err := s.c.ZRevRangeWithScores(ctx, keyVotes, 0, -1).Result()
	if err != nil {
		return nil, err
	}
	texts, err := s.c.HGetAll(ctx, keyText).Result()
	if err != nil {
		return nil, err
	}
	out := make([]Item, 0, len(zs))
	for _, z := range zs {
		id := z.Member.(string)
		out = append(out, Item{ID: id, Text: texts[id], Votes: int64(z.Score)})
	}
	return out, nil
}

func (s *redisStore) Vote(ctx context.Context, id string) (int64, error) {
	if s.c.HExists(ctx, keyText, id).Val() == false {
		return 0, errors.New("no such item")
	}
	n, err := s.c.ZIncrBy(ctx, keyVotes, 1, id).Result()
	return int64(n), err
}

func (s *redisStore) Add(ctx context.Context, text string) (Item, error) {
	if s.c.HLen(ctx, keyText).Val() >= maxItems {
		return Item{}, errors.New("the list is full")
	}
	id := newID()
	if err := s.c.HSet(ctx, keyText, id, text).Err(); err != nil {
		return Item{}, err
	}
	s.c.ZAdd(ctx, keyVotes, redis.Z{Score: 1, Member: id})
	return Item{ID: id, Text: text, Votes: 1}, nil
}

// ---------------------------------------------------------------- memory

type memStore struct {
	mu    sync.Mutex
	items map[string]*Item
}

func newMemStore() *memStore { return &memStore{items: map[string]*Item{}} }

func (m *memStore) Name() string { return "memory" }

func (m *memStore) Seed(items []string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if len(m.items) > 0 {
		return
	}
	for i, t := range items {
		id := "seed" + strconv.Itoa(i)
		m.items[id] = &Item{ID: id, Text: t}
	}
}

func (m *memStore) List(_ context.Context) ([]Item, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	out := make([]Item, 0, len(m.items))
	for _, it := range m.items {
		out = append(out, *it)
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].Votes != out[j].Votes {
			return out[i].Votes > out[j].Votes
		}
		return out[i].ID < out[j].ID
	})
	return out, nil
}

func (m *memStore) Vote(_ context.Context, id string) (int64, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	it, ok := m.items[id]
	if !ok {
		return 0, errors.New("no such item")
	}
	it.Votes++
	return it.Votes, nil
}

func (m *memStore) Add(_ context.Context, text string) (Item, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if len(m.items) >= maxItems {
		return Item{}, errors.New("the list is full")
	}
	it := &Item{ID: newID(), Text: text, Votes: 1}
	m.items[it.ID] = it
	return *it, nil
}

// ------------------------------------------------------------- lazy store
//
// Valkey is often not ready when the first app pod starts (Argo creates both
// at the same time). Instead of settling for the in-memory store for the life
// of the pod, keep trying in the background and switch over when it answers.

type lazyStore struct {
	addr string
	seed []string
	mu   sync.RWMutex
	cur  Store
}

func newLazyStore(addr string) Store {
	first := newStore(addr)
	l := &lazyStore{addr: addr, cur: first}
	if _, mem := first.(*memStore); mem && addr != "" {
		go l.retry()
	}
	return l
}

func (l *lazyStore) retry() {
	for {
		time.Sleep(5 * time.Second)
		c := redis.NewClient(&redis.Options{Addr: l.addr, DialTimeout: 2 * time.Second, ReadTimeout: 2 * time.Second})
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		err := c.Ping(ctx).Err()
		cancel()
		if err != nil {
			c.Close()
			continue
		}
		rs := &redisStore{c: c}
		l.mu.RLock()
		seed := l.seed
		l.mu.RUnlock()
		rs.Seed(seed)
		l.mu.Lock()
		l.cur = rs
		l.mu.Unlock()
		log.Printf("valkey at %s is up: switched from the in-memory store", l.addr)
		return
	}
}

func (l *lazyStore) get() Store { l.mu.RLock(); defer l.mu.RUnlock(); return l.cur }

func (l *lazyStore) Name() string { return l.get().Name() }
func (l *lazyStore) Seed(items []string) {
	l.mu.Lock()
	l.seed = items
	l.mu.Unlock()
	l.get().Seed(items)
}
func (l *lazyStore) List(ctx context.Context) ([]Item, error)           { return l.get().List(ctx) }
func (l *lazyStore) Vote(ctx context.Context, id string) (int64, error) { return l.get().Vote(ctx, id) }
func (l *lazyStore) Add(ctx context.Context, text string) (Item, error) {
	return l.get().Add(ctx, text)
}
