package paths

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
)

// MaquetaDir returns the path to the Eros template directory.
// Resolution order:
//  1. EROS_MAQUETA_DIR env var
//  2. ~/Desktop/Eros (must contain AGENTS.md to be considered valid)
//  3. error
func MaquetaDir() (string, error) {
	if env := os.Getenv("EROS_MAQUETA_DIR"); env != "" {
		if err := validate(env); err != nil {
			return "", fmt.Errorf("EROS_MAQUETA_DIR invalid: %w", err)
		}
		return env, nil
	}

	home, err := userHome()
	if err != nil {
		return "", err
	}

	fallback := filepath.Join(home, "Desktop", "Eros")
	if err := validate(fallback); err != nil {
		return "", fmt.Errorf("no EROS_MAQUETA_DIR set and fallback %q invalid: %w\nSet EROS_MAQUETA_DIR or clone the Eros repo to ~/Desktop/Eros", fallback, err)
	}
	return fallback, nil
}

func validate(dir string) error {
	agents := filepath.Join(dir, "AGENTS.md")
	if _, err := os.Stat(agents); err != nil {
		return fmt.Errorf("missing AGENTS.md")
	}
	return nil
}

func userHome() (string, error) {
	if runtime.GOOS == "windows" {
		if h := os.Getenv("USERPROFILE"); h != "" {
			return h, nil
		}
	}
	if h := os.Getenv("HOME"); h != "" {
		return h, nil
	}
	return os.UserHomeDir()
}

// ProjectDir returns the target directory for a given slug under ~/Desktop/.
func ProjectDir(slug string) (string, error) {
	home, err := userHome()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, "Desktop", slug), nil
}

// ScriptPath returns the path to a script file inside the maqueta scripts/ dir.
func ScriptPath(rel ...string) (string, error) {
	mq, err := MaquetaDir()
	if err != nil {
		return "", err
	}
	parts := append([]string{mq, "scripts"}, rel...)
	return filepath.Join(parts...), nil
}
