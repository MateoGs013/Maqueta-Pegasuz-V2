package moods

import (
	"path/filepath"
	"testing"
)

func TestLoad(t *testing.T) {
	fixture, _ := filepath.Abs("../../testdata/fake-maqueta")
	t.Setenv("EROS_MAQUETA_DIR", fixture)

	profiles, err := Load()
	if err != nil {
		t.Fatal(err)
	}
	if len(profiles) < 2 {
		t.Fatalf("expected at least 2 profiles, got %d", len(profiles))
	}
	if profiles[0].Label != "Dark cinematic editorial" {
		t.Errorf("first profile label = %q, want Dark cinematic editorial", profiles[0].Label)
	}
	if len(profiles[0].Families) != 3 {
		t.Errorf("first profile families count = %d, want 3", len(profiles[0].Families))
	}
}
