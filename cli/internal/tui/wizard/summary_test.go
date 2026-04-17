package wizard

import (
	"strings"
	"testing"

	"github.com/MateoGs013/eros/cli/internal/brief"
)

func TestSummaryView_ShowsAllFields(t *testing.T) {
	m := New(Options{})
	m.Brief = brief.Brief{
		Name:        "Northstar",
		Slug:        "northstar",
		Type:        "creative-studio",
		Mood:        "Dark cinematic editorial",
		Scheme:      "dark",
		Pages:       []string{"home", "work"},
		Mode:        "autonomous",
		References:  []string{"https://a.com", "https://b.com"},
		BannedSeeds: []string{"S-BentoDashboard"},
	}
	m.step = stepSummary
	m.width = 120
	m.height = 40

	v := m.View()
	for _, want := range []string{
		"Northstar",
		"northstar",
		"creative-studio",
		"Dark cinematic editorial",
		"home, work",
		"autonomous",
		"2 URLs",
		"1 seeds",
		"Desktop",
	} {
		if !strings.Contains(v, want) {
			t.Errorf("summary missing %q\n---\n%s", want, v)
		}
	}
}
