package templates

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/MateoGs013/eros/cli/internal/brief"
	"github.com/MateoGs013/eros/cli/internal/config"
)

// Save persists a brief as a reusable template. name/slug are stripped so the template is generic.
func Save(name string, b brief.Brief) error {
	dir, err := config.TemplatesDir()
	if err != nil {
		return err
	}
	b.Name = ""
	b.Slug = ""
	data, err := json.MarshalIndent(b, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(dir, name+".json"), data, 0o644)
}

// Load returns a template by name.
func Load(name string) (brief.Brief, error) {
	dir, err := config.TemplatesDir()
	if err != nil {
		return brief.Brief{}, err
	}
	data, err := os.ReadFile(filepath.Join(dir, name+".json"))
	if err != nil {
		return brief.Brief{}, fmt.Errorf("template %q not found: %w", name, err)
	}
	var b brief.Brief
	if err := json.Unmarshal(data, &b); err != nil {
		return brief.Brief{}, err
	}
	return b, nil
}

// List returns all available template names sorted alphabetically.
func List() ([]string, error) {
	dir, err := config.TemplatesDir()
	if err != nil {
		return nil, err
	}
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	var names []string
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".json") {
			continue
		}
		names = append(names, strings.TrimSuffix(e.Name(), ".json"))
	}
	sort.Strings(names)
	return names, nil
}

// Delete removes a template by name.
func Delete(name string) error {
	dir, err := config.TemplatesDir()
	if err != nil {
		return err
	}
	return os.Remove(filepath.Join(dir, name+".json"))
}
