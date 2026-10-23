// jakarta-votes: the audience scans a QR code and votes on what Dinesh should
// do on his free day in Jakarta. Small on purpose: one binary, no external
// assets (conference wifi), state in Valkey with an in-memory fallback.
package main

import (
	"context"
	"crypto/sha256"
	"embed"
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	qrcode "github.com/skip2/go-qrcode"
)

//go:embed templates/*.html
var templates embed.FS

var version = "dev" // set with -ldflags "-X main.version=..."

type app struct {
	store   Store
	tmpl    *template.Template
	title   string
	color   string
	pod     string
	node    string
	public  string // PUBLIC_URL override for the QR code; else derived from Host
	started time.Time
}

func env(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func main() {
	a := &app{
		title:   env("TITLE", "Dinesh has a free day in Jakarta. What should he do?"),
		color:   env("THEME_COLOR", "#00FF6F"),
		pod:     env("POD_NAME", hostnameOr("local")),
		node:    env("NODE_NAME", "local"),
		public:  os.Getenv("PUBLIC_URL"),
		started: time.Now(),
	}
	a.tmpl = template.Must(template.ParseFS(templates, "templates/*.html"))
	a.store = newStore(os.Getenv("REDIS_ADDR"))
	a.store.Seed(defaultItems)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /", a.votePage)
	mux.HandleFunc("GET /board", a.boardPage)
	mux.HandleFunc("GET /qr.png", a.qr)
	mux.HandleFunc("GET /api/items", a.apiItems)
	mux.HandleFunc("POST /api/vote", a.apiVote)
	mux.HandleFunc("POST /api/suggest", a.apiSuggest)
	mux.HandleFunc("GET /api/whoami", a.apiWhoami)
	mux.HandleFunc("GET /api/burn", a.apiBurn)
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) { w.Write([]byte("ok")) })
	mux.HandleFunc("GET /readyz", func(w http.ResponseWriter, _ *http.Request) { w.Write([]byte("ok")) })

	addr := ":" + env("PORT", "8080")
	log.Printf("jakarta-votes %s listening on %s (pod=%s node=%s store=%s)", version, addr, a.pod, a.node, a.store.Name())
	srv := &http.Server{Addr: addr, Handler: a.identify(mux), ReadHeaderTimeout: 5 * time.Second}
	log.Fatal(srv.ListenAndServe())
}

func hostnameOr(def string) string {
	if h, err := os.Hostname(); err == nil && h != "" {
		return h
	}
	return def
}

// identify stamps every response with who served it: visible proof on the
// projector that requests are spread across pods and nodes.
func (a *app) identify(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Pod", a.pod)
		w.Header().Set("X-Node", a.node)
		w.Header().Set("X-Version", version)
		next.ServeHTTP(w, r)
	})
}

type pageData struct {
	Title, Color, Pod, Node, Version, Store, PublicURL string
	Items                                              []Item
}

func (a *app) publicURL(r *http.Request) string {
	if a.public != "" {
		return a.public
	}
	scheme := "http"
	if r.TLS != nil || r.Header.Get("X-Forwarded-Proto") == "https" {
		scheme = "https"
	}
	return scheme + "://" + r.Host
}

func (a *app) data(r *http.Request) pageData {
	items, _ := a.store.List(r.Context())
	return pageData{Title: a.title, Color: a.color, Pod: a.pod, Node: a.node,
		Version: version, Store: a.store.Name(), PublicURL: a.publicURL(r), Items: items}
}

func (a *app) votePage(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	a.render(w, "vote.html", a.data(r))
}

func (a *app) boardPage(w http.ResponseWriter, r *http.Request) {
	a.render(w, "board.html", a.data(r))
}

func (a *app) render(w http.ResponseWriter, name string, d pageData) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	if err := a.tmpl.ExecuteTemplate(w, name, d); err != nil {
		log.Printf("render %s: %v", name, err)
	}
}

func (a *app) qr(w http.ResponseWriter, r *http.Request) {
	png, err := qrcode.Encode(a.publicURL(r), qrcode.Medium, 512)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.Header().Set("Content-Type", "image/png")
	w.Header().Set("Cache-Control", "public, max-age=300")
	w.Write(png)
}

func (a *app) apiItems(w http.ResponseWriter, r *http.Request) {
	items, err := a.store.List(r.Context())
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	writeJSON(w, map[string]any{"items": items, "pod": a.pod, "node": a.node, "version": version, "store": a.store.Name()})
}

func (a *app) apiVote(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimSpace(r.FormValue("id"))
	if id == "" {
		http.Error(w, "missing id", 400)
		return
	}
	n, err := a.store.Vote(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	writeJSON(w, map[string]any{"id": id, "votes": n, "pod": a.pod})
}

func (a *app) apiSuggest(w http.ResponseWriter, r *http.Request) {
	text := clean(r.FormValue("text"), 80)
	if len(text) < 3 {
		http.Error(w, "too short", 400)
		return
	}
	item, err := a.store.Add(r.Context(), text)
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	writeJSON(w, item)
}

func (a *app) apiWhoami(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, map[string]any{"pod": a.pod, "node": a.node, "version": version,
		"store": a.store.Name(), "uptime": time.Since(a.started).Round(time.Second).String()})
}

// apiBurn does a few milliseconds of real CPU work per request. The load
// generator in demo step 6 hits this so the HPA has something to react to;
// listing a dozen items is too cheap to push a pod past its CPU request.
func (a *app) apiBurn(w http.ResponseWriter, r *http.Request) {
	sum := sha256.Sum256([]byte(a.pod))
	for i := 0; i < 20000; i++ {
		sum = sha256.Sum256(sum[:])
	}
	items, _ := a.store.List(r.Context())
	writeJSON(w, map[string]any{"pod": a.pod, "items": len(items), "digest": hex(sum[:4])})
}

func hex(b []byte) string {
	const d = "0123456789abcdef"
	out := make([]byte, 0, len(b)*2)
	for _, c := range b {
		out = append(out, d[c>>4], d[c&15])
	}
	return string(out)
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	json.NewEncoder(w).Encode(v)
}

// clean trims, collapses whitespace and caps length. Templates HTML-escape on
// output, so this is about tidiness, not security.
func clean(s string, max int) string {
	s = strings.Join(strings.Fields(s), " ")
	r := []rune(s)
	if len(r) > max {
		r = r[:max]
	}
	return string(r)
}

var _ = context.Background
