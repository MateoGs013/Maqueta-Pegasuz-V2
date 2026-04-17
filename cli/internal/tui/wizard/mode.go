package wizard

import (
	"github.com/charmbracelet/bubbles/key"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"github.com/MateoGs013/eros/cli/internal/tui/keys"
	"github.com/MateoGs013/eros/cli/internal/tui/styles"
)

var modeOptions = []struct{ ID, Hint string }{
	{"autonomous", "Eros construye todo solo (default)"},
	{"interactive", "Pausa en 3 gates clave para tu aprobación"},
	{"supervised", "Pausa después de cada section — lento pero control total"},
}

type modeState struct{ cursor int }

func modeInit(m *Model) {
	m.modeS = modeState{cursor: 0}
	for i, o := range modeOptions {
		if o.ID == m.Brief.Mode {
			m.modeS.cursor = i
			return
		}
	}
}

func modeUpdate(m Model, msg tea.KeyMsg) (Model, tea.Cmd) {
	km := keys.Default()
	switch {
	case key.Matches(msg, km.Up):
		if m.modeS.cursor > 0 {
			m.modeS.cursor--
		}
	case key.Matches(msg, km.Down):
		if m.modeS.cursor < len(modeOptions)-1 {
			m.modeS.cursor++
		}
	case key.Matches(msg, km.Enter):
		m.Brief.Mode = modeOptions[m.modeS.cursor].ID
		m.Advance()
	case key.Matches(msg, km.Back):
		m.Back()
	case key.Matches(msg, km.Quit):
		return m, tea.Quit
	}
	return m, nil
}

func modeView(m Model) string {
	theme := styles.NewTheme(m.Brief.Mood)
	title := theme.Title.Render("Modo de operación")
	rule := styles.TitleUnderline(title, theme.Accent)

	var lines []string
	for i, o := range modeOptions {
		prefix := theme.Unselected.String()
		content := theme.Value.Render(o.ID) + styles.Gap(2) + theme.Hint.Render(o.Hint)
		if i == m.modeS.cursor {
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
