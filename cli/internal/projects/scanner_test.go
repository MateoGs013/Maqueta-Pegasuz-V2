package projects

import (
	"os"
	"path/filepath"
	"testing"
)

func TestScan(t *testing.T) {
	tmp := t.TempDir()
	desktop := filepath.Join(tmp, "Desktop")

	mkProject(t, desktop, "northstar-atelier", `
# Eros State
- **Project:** Northstar Atelier (northstar-atelier)
- **Phase:** 3
- **Task:** build/S-Hero
- **Mode:** autonomous
- **Sections:** 4/12
`)

	mkProject(t, desktop, "coque", `
# Eros State
- **Project:** Coque (coque)
- **Phase:** 6
- **Task:** cleanup/retrospective
- **Mode:** autonomous
- **Sections:** 12/12
`)

	if err := os.MkdirAll(filepath.Join(desktop, "random-folder"), 0o755); err != nil {
		t.Fatal(err)
	}

	t.Setenv("HOME", tmp)
	t.Setenv("USERPROFILE", tmp)

	prjs, err := Scan()
	if err != nil {
		t.Fatal(err)
	}
	if len(prjs) != 2 {
		t.Errorf("expected 2 projects, got %d", len(prjs))
	}

	if prjs[0].Slug != "coque" || prjs[1].Slug != "northstar-atelier" {
		t.Errorf("unexpected order: %+v", prjs)
	}

	if prjs[0].Phase != "6" {
		t.Errorf("coque phase = %q, want 6", prjs[0].Phase)
	}
	if prjs[1].SectionsDone != 4 || prjs[1].SectionsTotal != 12 {
		t.Errorf("northstar sections = %d/%d, want 4/12", prjs[1].SectionsDone, prjs[1].SectionsTotal)
	}
}

func mkProject(t *testing.T, desktop, slug, stateContent string) {
	t.Helper()
	dir := filepath.Join(desktop, slug, ".eros")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "state.md"), []byte(stateContent), 0o644); err != nil {
		t.Fatal(err)
	}
}
