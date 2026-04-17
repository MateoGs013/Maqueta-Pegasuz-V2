package templates

import (
	"testing"

	"github.com/MateoGs013/eros/cli/internal/brief"
)

func TestSaveLoadList(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("APPDATA", tmp)
	t.Setenv("HOME", tmp)

	b := brief.Brief{Type: "creative-studio", Mood: "Dark cinematic editorial", Scheme: "dark"}

	if err := Save("dark-studio", b); err != nil {
		t.Fatal(err)
	}

	names, err := List()
	if err != nil {
		t.Fatal(err)
	}
	if len(names) != 1 || names[0] != "dark-studio" {
		t.Errorf("List() = %v, want [dark-studio]", names)
	}

	loaded, err := Load("dark-studio")
	if err != nil {
		t.Fatal(err)
	}
	if loaded.Mood != b.Mood {
		t.Errorf("loaded mood = %q, want %q", loaded.Mood, b.Mood)
	}

	if loaded.Name != "" || loaded.Slug != "" {
		t.Errorf("template should not persist name/slug, got name=%q slug=%q", loaded.Name, loaded.Slug)
	}
}
