package config

import (
	"encoding/json"
	"os"
	"path/filepath"

	"github.com/MateoGs013/eros/cli/internal/brief"
)

// SaveDraft writes the current brief to the config dir as draft.json.
func SaveDraft(b brief.Brief) error {
	d, err := Ensure()
	if err != nil {
		return err
	}
	data, err := json.MarshalIndent(b, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(d, "draft.json"), data, 0o644)
}

// LoadDraft reads draft.json if present. Returns (Brief{}, false, nil) when missing.
func LoadDraft() (brief.Brief, bool, error) {
	d, err := Dir()
	if err != nil {
		return brief.Brief{}, false, err
	}
	data, err := os.ReadFile(filepath.Join(d, "draft.json"))
	if err != nil {
		if os.IsNotExist(err) {
			return brief.Brief{}, false, nil
		}
		return brief.Brief{}, false, err
	}
	var b brief.Brief
	if err := json.Unmarshal(data, &b); err != nil {
		return brief.Brief{}, false, err
	}
	return b, true, nil
}
