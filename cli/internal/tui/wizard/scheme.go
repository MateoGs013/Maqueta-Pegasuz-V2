package wizard

import (
	"github.com/charmbracelet/bubbles/key"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"github.com/MateoGs013/eros/cli/internal/tui/keys"
	"github.com/MateoGs013/eros/cli/internal/tui/styles"
)

type schemeState struct{ cursor int }

var schemeOptions = []struct{ ID, Hint string }{
	{"dark", "warm near-blacks, high contrast"},
	{"light", "warm whites, restrained shadow"},
}

func schemeInit(m *Model) {
	m.schemeS = schemeState{cursor: 0}
	if m.Brief.Scheme == "light" {
		m.schemeS.cursor = 1
	}
}

func schemeUpdate(m Model, msg tea.KeyMsg) (Model, tea.Cmd) {
	km := keys.Default()
	switch {
	case key.Matches(msg, km.Up):
		if m.schemeS.cursor > 0 {
			m.schemeS.cursor--
		}
	case key.Matches(msg, km.Down):
		if m.schemeS.cursor < len(schemeOptions)-1 {
			m.schemeS.cursor++
		}
	case key.Matches(msg, km.Enter):
		m.Brief.Scheme = schemeOptions[m.schemeS.cursor].ID
		m.Advance()
	case key.Matches(msg, km.Back):
		m.Back()
	case key.Matches(msg, km.Quit):
		return m, tea.Quit
	}
	return m, nil
}

func schemeView(m Model) string {
	theme := styles.NewTheme(m.Brief.Mood)
	title := theme.Title.Render("Scheme")
	rule := styles.TitleUnderline(title, theme.Accent)

	var lines []string
	for i, o := range schemeOptions {
		prefix := theme.Unselected.String()
		content := theme.Value.Render(o.ID) + styles.Gap(2) + theme.Hint.Render(o.Hint)
		if i == m.schemeS.cursor {
			prefix = theme.Selected.String()
			content = theme.Value.Bold(true).Render(o.ID) + styles.Gap(2) + theme.Hint.Render(o.Hint)
		}
		lines = append(lines, prefix+content)
	}

	hint := theme.Hint.Render("↑↓ navegar · Enter pick · Esc volver")
	body := lipgloss.JoinVertical(lipgloss.Left, append([]string{title, rule, ""}, lines...)...)
	body += "\n\n" + hint
	return styles.Page(body, m.width, m.height)
}
