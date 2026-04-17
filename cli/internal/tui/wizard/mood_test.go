package wizard

import (
	"strings"
	"testing"

	"github.com/MateoGs013/eros/cli/internal/moods"
)

func TestMoodView_ShowsPreview(t *testing.T) {
	profiles := []moods.Profile{
		{
			Label:       "Dark cinematic editorial",
			Families:    []string{"cinematic", "ambient", "editorial"},
			Canvas:      "Near-black canvas.",
			Text:        "Warm white.",
			Accent:      "Sparingly.",
			DisplayRole: "High-contrast.",
			MotionAvoid: "Fade-only.",
		},
		{
			Label:    "Brutalist bold",
			Families: []string{"brutalist", "typography-led"},
			Canvas:   "High-contrast.",
		},
	}
	m := New(Options{Profiles: profiles})
	m.step = stepMood
	m.width = 160
	m.height = 40

	view := m.View()
	for _, want := range []string{
		"Dark cinematic editorial",
		"Brutalist bold",
		"Preview",
		"cinematic · ambient · editorial",
		"Near-black canvas.",
	} {
		if !strings.Contains(view, want) {
			t.Errorf("mood view missing %q\n---\n%s", want, view)
		}
	}
}
