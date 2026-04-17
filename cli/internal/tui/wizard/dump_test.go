package wizard

import (
	"bytes"
	"fmt"
	"os"
	"regexp"
	"strings"
	"testing"

	"github.com/charmbracelet/lipgloss"

	"github.com/MateoGs013/eros/cli/internal/moods"
)

// TestDumpAllViews renders each pantalla to stdout with TERM=xterm-256color so
// the dump file shows ANSI colors. The point of this test is visual QA — run
// `go test -v -run TestDumpAllViews ./internal/tui/wizard` and inspect
// .test-dump.ansi in the working dir.
//
// It also asserts that no line contains a reset sequence followed by a plain
// space run, which is the signature of bg-bleed.
func TestDumpAllViews(t *testing.T) {
	profiles := []moods.Profile{
		{Label: "Dark cinematic editorial", Families: []string{"cinematic", "ambient", "editorial"}, Canvas: "near-black", Text: "warm white", Accent: "amber"},
		{Label: "Brutalist bold", Families: []string{"brutalist"}, Canvas: "off-white", Text: "ink", Accent: "red"},
	}

	m := New(Options{Profiles: profiles})
	m.width = 120
	m.height = 40
	m.Brief.Name = "Northstar Atelier"
	m.Brief.Slug = "northstar-atelier"
	m.Brief.Mood = "Dark cinematic editorial"
	m.Brief.SeedFamilies = []string{"cinematic"}

	stepNames := map[step]string{
		stepSplash:         "splash",
		stepTemplateLoader: "template_loader",
		stepName:           "name",
		stepSlug:           "slug",
		stepType:           "type",
		stepMood:           "mood",
		stepScheme:         "scheme",
		stepPages:          "pages",
		stepMode:           "mode",
		stepReferences:     "references",
		stepConstraints:    "constraints",
		stepBannedSeeds:    "banned_seeds",
		stepAdvanced:       "advanced",
		stepSummary:        "summary",
		stepLaunch:         "launch",
	}

	var out bytes.Buffer
	// Regex: ESC[0m (reset) followed by 2+ plain spaces (bleed signature).
	bleedRe := regexp.MustCompile(`\x1b\[0m {2,}`)

	for step, name := range stepNames {
		m.step = step
		view := m.View()
		fmt.Fprintf(&out, "\n\n===== %s =====\n\n%s", name, view)

		// Strip the outer full-screen whitespace padding and scan inner lines.
		lines := strings.Split(view, "\n")
		for i, l := range lines {
			if bleedRe.MatchString(l) {
				// Find first offense for a useful failure message.
				loc := bleedRe.FindStringIndex(l)
				t.Errorf("bleed in %s line %d col %d (reset followed by %d+ plain spaces)",
					name, i, loc[0], 2)
				break
			}
		}
	}

	if dumpPath := os.Getenv("EROS_DUMP"); dumpPath != "" {
		_ = os.WriteFile(dumpPath, out.Bytes(), 0o644)
	}
}

// TestBlockStableForStableContent asserts the block width stays the same
// between no-input and small-input states (under the length of other stable
// lines like the input border or hint). The block is content-driven, so
// typing chars that don't exceed other lines should not shift the block.
// Block width is derived by measuring the consistent-across-lines structural
// width (every output line is exactly w cells wide, so this test asserts
// at least that the final output structure stays uniform).
func TestBlockStableForStableContent(t *testing.T) {
	m := New(Options{})
	m.width = 120
	m.height = 40
	m.Brief.Mood = "Dark cinematic editorial"
	m.step = stepName

	firstRenderedLineWidth := func() int {
		view := m.View()
		for _, l := range strings.Split(view, "\n") {
			if lipgloss.Width(l) > 0 {
				return lipgloss.Width(l)
			}
		}
		return 0
	}

	empty := firstRenderedLineWidth()
	m.name.input.SetValue("x")
	oneChar := firstRenderedLineWidth()

	// Every rendered line spans the full viewport width (leftGutter + block +
	// rightGutter = viewport width). This invariant must hold across input
	// state — if it breaks, rendering is emitting inconsistently sized rows.
	if empty != 120 || oneChar != 120 {
		t.Errorf("output line width not matching viewport: empty=%d oneChar=%d, want 120",
			empty, oneChar)
	}
}
