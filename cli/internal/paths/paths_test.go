package paths

import (
	"os"
	"path/filepath"
	"testing"
)

func TestMaquetaDir_EnvVar(t *testing.T) {
	tmp := t.TempDir()
	if err := os.WriteFile(filepath.Join(tmp, "AGENTS.md"), []byte("# AGENTS"), 0o644); err != nil {
		t.Fatal(err)
	}
	t.Setenv("EROS_MAQUETA_DIR", tmp)

	got, err := MaquetaDir()
	if err != nil {
		t.Fatal(err)
	}
	if got != tmp {
		t.Errorf("MaquetaDir = %q, want %q", got, tmp)
	}
}

func TestMaquetaDir_Fallback(t *testing.T) {
	t.Setenv("EROS_MAQUETA_DIR", "")

	home := t.TempDir()
	t.Setenv("USERPROFILE", home)
	t.Setenv("HOME", home)
	desktop := filepath.Join(home, "Desktop", "Eros")
	if err := os.MkdirAll(filepath.Join(desktop, "scripts", "pipeline"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(desktop, "AGENTS.md"), []byte("# AGENTS"), 0o644); err != nil {
		t.Fatal(err)
	}

	got, err := MaquetaDir()
	if err != nil {
		t.Fatal(err)
	}
	if got != desktop {
		t.Errorf("MaquetaDir = %q, want %q", got, desktop)
	}
}

func TestMaquetaDir_NotFound(t *testing.T) {
	t.Setenv("EROS_MAQUETA_DIR", "")
	home := t.TempDir()
	t.Setenv("USERPROFILE", home)
	t.Setenv("HOME", home)

	_, err := MaquetaDir()
	if err == nil {
		t.Error("expected error when maqueta not found")
	}
}
