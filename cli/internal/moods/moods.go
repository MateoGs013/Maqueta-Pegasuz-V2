package moods

import (
	"encoding/json"
	"fmt"
	"os/exec"

	"github.com/MateoGs013/eros/cli/internal/paths"
)

// Profile mirrors the JSON shape emitted by scripts/pipeline/export-moods.mjs.
type Profile struct {
	Label       string   `json:"label"`
	Families    []string `json:"families"`
	Canvas      string   `json:"canvas"`
	Text        string   `json:"text"`
	Accent      string   `json:"accent"`
	DisplayRole string   `json:"displayRole"`
	MotionAvoid string   `json:"motionAvoid"`
}

// Load runs export-moods.mjs and parses the output.
func Load() ([]Profile, error) {
	script, err := paths.ScriptPath("pipeline", "export-moods.mjs")
	if err != nil {
		return nil, err
	}
	cmd := exec.Command("node", script)
	out, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("export-moods.mjs failed: %w", err)
	}

	var profiles []Profile
	if err := json.Unmarshal(out, &profiles); err != nil {
		return nil, fmt.Errorf("parse moods JSON: %w", err)
	}
	return profiles, nil
}

// ByLabel returns the profile matching a label, or (Profile{}, false).
func ByLabel(profiles []Profile, label string) (Profile, bool) {
	for _, p := range profiles {
		if p.Label == label {
			return p, true
		}
	}
	return Profile{}, false
}
