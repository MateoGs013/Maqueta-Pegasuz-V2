package runner

import (
	"errors"
	"os"
	"os/exec"
	"path/filepath"
)

// FindClaude locates the `claude` binary.
// Order: PATH → %APPDATA%\npm\claude.cmd → %LOCALAPPDATA%\Programs\claude\claude.exe
func FindClaude() (string, error) {
	if p, err := exec.LookPath("claude"); err == nil {
		return p, nil
	}

	candidates := []string{
		filepath.Join(os.Getenv("APPDATA"), "npm", "claude.cmd"),
		filepath.Join(os.Getenv("LOCALAPPDATA"), "Programs", "claude", "claude.exe"),
	}
	for _, c := range candidates {
		if c == "" {
			continue
		}
		if _, err := os.Stat(c); err == nil {
			return c, nil
		}
	}
	return "", errors.New("claude no encontrado en PATH — instalá con `npm install -g @anthropic-ai/claude-code`")
}

// LaunchClaude spawns claude with the given initial prompt, inheriting stdio.
// This call blocks until Claude exits.
func LaunchClaude(projectDir, initialPrompt string) error {
	claudePath, err := FindClaude()
	if err != nil {
		return err
	}
	cmd := exec.Command(claudePath, initialPrompt)
	cmd.Dir = projectDir
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

// LaunchCommand returns the shell command string to manually reproduce the launch.
func LaunchCommand(projectDir, initialPrompt string) string {
	return `cd "` + projectDir + `"; claude "` + initialPrompt + `"`
}
