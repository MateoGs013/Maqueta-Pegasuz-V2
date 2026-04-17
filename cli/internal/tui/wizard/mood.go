package wizard

import (
	"strings"

	"github.com/charmbracelet/bubbles/key"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"github.com/MateoGs013/eros/cli/internal/moods"
	"github.com/MateoGs013/eros/cli/internal/tui/keys"
	"github.com/MateoGs013/eros/cli/internal/tui/styles"
)

type moodState struct{ cursor int }

func moodInit(m *Model) {
	m.moodS = moodState{cursor: 0}
	for i, p := range m.Options.Profiles {
		if p.Label == m.Brief.Mood {
			m.moodS.cursor = i
			return
		}
	}
}

func moodUpdate(m Model, msg tea.KeyMsg) (Model, tea.Cmd) {
	km := keys.Default()
	switch {
	case key.Matches(msg, km.Up):
		if m.moodS.cursor > 0 {
			m.moodS.cursor--
		}
	case key.Matches(msg, km.Down):
		if m.moodS.cursor < len(m.Options.Profiles)-1 {
			m.moodS.cursor++
		}
	case key.Matches(msg, km.Enter):
		profile := m.Options.Profiles[m.moodS.cursor]
		m.Brief.Mood = profile.Label
		m.Brief.SeedFamilies = profile.Families
		m.Advance()
	case key.Matches(msg, km.Back):
		m.Back()
	case key.Matches(msg, km.Quit):
		return m, tea.Quit
	}
	return m, nil
}

func moodView(m Model) string {
	var currentMood string
	if m.moodS.cursor < len(m.Options.Profiles) {
		currentMood = m.Options.Profiles[m.moodS.cursor].Label
	}
	theme := styles.NewTheme(currentMood)

	sidebar := renderMoodSidebar(m, theme)
	preview := renderMoodPreview(m, theme)

	// Pad the shorter column to the taller's height with bg rows so
	// JoinHorizontal doesn't fill the gap with plain spaces.
	sidebar, preview = equalizeColumns(sidebar, preview)

	row := lipgloss.JoinHorizontal(lipgloss.Top, sidebar, styles.Gap(2), preview)
	hint := theme.Hint.Render("↑↓ navegar · Enter pick · Esc volver")
	body := lipgloss.JoinVertical(lipgloss.Left, row, "", hint)
	return styles.Page(body, m.width, m.height)
}

// equalizeColumns pads each of a, b to the line count of the taller with
// bg-styled rows matching that column's visible width. Prevents
// lipgloss.JoinHorizontal from inserting plain-space padding rows between
// columns of unequal height.
func equalizeColumns(a, b string) (string, string) {
	aLines := strings.Split(a, "\n")
	bLines := strings.Split(b, "\n")

	aWidth := 0
	for _, l := range aLines {
		if w := lipgloss.Width(l); w > aWidth {
			aWidth = w
		}
	}
	bWidth := 0
	for _, l := range bLines {
		if w := lipgloss.Width(l); w > bWidth {
			bWidth = w
		}
	}

	max := len(aLines)
	if len(bLines) > max {
		max = len(bLines)
	}
	for len(aLines) < max {
		aLines = append(aLines, styles.PadLine("", aWidth, styles.NearBlack))
	}
	for len(bLines) < max {
		bLines = append(bLines, styles.PadLine("", bWidth, styles.NearBlack))
	}
	return strings.Join(aLines, "\n"), strings.Join(bLines, "\n")
}

func renderMoodSidebar(m Model, theme styles.Theme) string {
	title := theme.Title.Render("Mood")
	rule := styles.TitleUnderline(title, theme.Accent)
	var lines []string
	for i, p := range m.Options.Profiles {
		prefix := theme.Unselected.String()
		name := theme.Value.Render(p.Label)
		if i == m.moodS.cursor {
			prefix = theme.Selected.String()
			name = theme.Value.Bold(true).Render(p.Label)
		}
		lines = append(lines, prefix+name)
	}
	all := append([]string{title, rule, ""}, lines...)

	// Manually pad each line to fixed sidebar width with raw bg. lipgloss's
	// Width(N).Background(bg) on a multi-line Render emits plain-space padding
	// that leaks the terminal's default bg on some profiles.
	const sidebarWidth = 30
	padded := make([]string, len(all))
	for i, l := range all {
		padded[i] = styles.PadLine(l, sidebarWidth, styles.NearBlack)
	}
	return lipgloss.JoinVertical(lipgloss.Left, padded...)
}

func renderMoodPreview(m Model, theme styles.Theme) string {
	if m.moodS.cursor >= len(m.Options.Profiles) {
		return theme.PreviewBox.Render("(sin profiles cargados)")
	}
	p := m.Options.Profiles[m.moodS.cursor]

	label := theme.Label.Render
	val := theme.Value.Render

	lines := []string{
		theme.Title.Render("Preview: " + p.Label),
		"",
		label("Families  ") + val(joinCompact(p.Families)),
		label("Canvas    ") + val(p.Canvas),
		label("Text      ") + val(p.Text),
		label("Accent    ") + val(p.Accent),
		label("Display   ") + val(p.DisplayRole),
		label("Avoid     ") + val(p.MotionAvoid),
	}
	return theme.PreviewBox.Width(60).Render(lipgloss.JoinVertical(lipgloss.Left, lines...))
}

func joinCompact(s []string) string {
	out := ""
	for i, v := range s {
		if i > 0 {
			out += " · "
		}
		out += v
	}
	return out
}

// LoadProfiles is a helper so cmd/root can inject profiles when constructing a Model.
func LoadProfiles() []moods.Profile {
	profiles, err := moods.Load()
	if err != nil {
		return nil
	}
	return profiles
}
