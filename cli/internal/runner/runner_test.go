package runner

import (
	"context"
	"path/filepath"
	"testing"
)

func TestRunNodeScript_StreamsStdout(t *testing.T) {
	fixture, _ := filepath.Abs("../../testdata/fake-maqueta")
	t.Setenv("EROS_MAQUETA_DIR", fixture)

	var lines []string
	err := RunNodeScript(context.Background(), NodeOptions{
		ScriptRel: []string{"pipeline", "init-project.mjs"},
		Args:      []string{"--brief-file", "x.json"},
		OnLine:    func(line string) { lines = append(lines, line) },
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(lines) == 0 || lines[0] != "bootstrap complete" {
		t.Errorf("expected stdout line 'bootstrap complete', got %v", lines)
	}
}

func TestFindClaude_NotFound(t *testing.T) {
	t.Setenv("PATH", t.TempDir()) // empty PATH
	t.Setenv("APPDATA", t.TempDir())
	t.Setenv("LOCALAPPDATA", t.TempDir())
	_, err := FindClaude()
	if err == nil {
		t.Error("expected error when claude not in PATH")
	}
}
