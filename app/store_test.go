package main

import (
	"context"
	"testing"
)

func TestMemStore(t *testing.T) {
	s := newMemStore()
	s.Seed([]string{"a", "b"})
	items, _ := s.List(context.Background())
	if len(items) != 2 {
		t.Fatalf("want 2 items, got %d", len(items))
	}
	if _, err := s.Vote(context.Background(), items[1].ID); err != nil {
		t.Fatal(err)
	}
	items, _ = s.List(context.Background())
	if items[0].Votes != 1 {
		t.Fatalf("voted item should sort first, got %+v", items)
	}
	if _, err := s.Vote(context.Background(), "nope"); err == nil {
		t.Fatal("expected error for unknown id")
	}
	if clean("  a   b  ", 3) != "a b" {
		t.Fatal("clean should collapse whitespace")
	}
}
