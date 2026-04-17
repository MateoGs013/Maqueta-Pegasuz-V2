package config

import (
	"os"
	"path/filepath"
	"runtime"
)

// Dir returns ~/.config/eros (or %APPDATA%\eros on Windows).
func Dir() (string, error) {
	if runtime.GOOS == "windows" {
		if appdata := os.Getenv("APPDATA"); appdata != "" {
			return filepath.Join(appdata, "eros"), nil
		}
	}
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ".config", "eros"), nil
}

// Ensure creates the config dir if missing and returns its path.
func Ensure() (string, error) {
	d, err := Dir()
	if err != nil {
		return "", err
	}
	if err := os.MkdirAll(d, 0o755); err != nil {
		return "", err
	}
	return d, nil
}

// TemplatesDir returns the templates subdir, creating it if missing.
func TemplatesDir() (string, error) {
	d, err := Ensure()
	if err != nil {
		return "", err
	}
	td := filepath.Join(d, "templates")
	if err := os.MkdirAll(td, 0o755); err != nil {
		return "", err
	}
	return td, nil
}
