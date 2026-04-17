package wizard

import (
	"github.com/charmbracelet/bubbles/key"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"github.com/MateoGs013/eros/cli/internal/templates"
	"github.com/MateoGs013/eros/cli/internal/tui/keys"
	"github.com/MateoGs013/eros/cli/internal/tui/styles"
)

type templateLoaderState struct {
	names  []string
	cursor int // -1 = "scratch"
}

func templateLoaderInit(m *Model) {
	names, _ := templates.List()
	m.tplLoader = templateLoaderState{
		names:  names,
		cursor: -1,
	}
}

func templateLoaderUpdate(m Model, msg tea.KeyMsg) (Model, tea.Cmd) {
	km := keys.Default()
	switch {
	case key.Matches(msg, km.Up):
		if m.tplLoader.cursor > -1 {
			m.tplLoader.cursor--
		}
	case key.Matches(msg, km.Down):
		if m.tplLoader.cursor < len(m.tplLoader.names)-1 {
			m.tplLoader.cursor++
		}
	case key.Matches(msg, km.Enter):
		if m.tplLoader.cursor >= 0 {
			if t, err := templates.Load(m.tplLoader.names[m.tplLoader.cursor]); err == nil {
				t.Name = m.Brief.Name
				t.Slug = m.Brief.Slug
				m.Brief = t
			}
		}
		m.step = stepName
	case key.Matches(msg, km.Back):
		m.step = stepSplash
	case key.Matches(msg, km.Quit):
		return m, tea.Quit
	}
	return m, nil
}

func templateLoaderView(m Model) string {
	theme := styles.NewTheme(m.Brief.Mood)

	title := theme.Title.Render("Cargar desde template")
	rule := styles.TitleUnderline(title, theme.Accent)
	options := []string{"scratch (empezar de cero)"}
	options = append(options, m.tplLoader.names...)

	lines := make([]string, len(options))
	for i, opt := range options {
		prefix := theme.Unselected.String()
		if (i - 1) == m.tplLoader.cursor {
			prefix = theme.Selected.String()
		}
		lines[i] = prefix + theme.Value.Render(opt)
	}

	hint := theme.Hint.Render("↑↓ navegar · Enter pick · Esc volver")
	parts := append([]string{title, rule, ""}, lines...)
	parts = append(parts, "", hint)
	body := lipgloss.JoinVertical(lipgloss.Left, parts...)

	return styles.Page(body, m.width, m.height)
}
