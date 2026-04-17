package wizard

import (
	"fmt"
	"net/url"

	"github.com/charmbracelet/bubbles/key"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"github.com/MateoGs013/eros/cli/internal/tui/keys"
	"github.com/MateoGs013/eros/cli/internal/tui/styles"
)

type referencesState struct {
	input textinput.Model
	err   string
}

func referencesInit() referencesState {
	ti := textinput.New()
	ti.Placeholder = "https://referencia.com"
	ti.CharLimit = 200
	ti.Focus()
	return referencesState{input: ti}
}

func referencesUpdate(m Model, msg tea.KeyMsg) (Model, tea.Cmd) {
	km := keys.Default()
	switch {
	case key.Matches(msg, km.Tab):
		m.Advance()
		return m, nil
	case key.Matches(msg, km.Enter):
		val := m.refs.input.Value()
		if val == "" {
			m.Advance()
			return m, nil
		}
		u, err := url.Parse(val)
		if err != nil || u.Scheme == "" || u.Host == "" {
			m.refs.err = "URL inválida — debe incluir http(s)://"
			return m, nil
		}
		m.Brief.References = append(m.Brief.References, val)
		m.refs.input.Reset()
		m.refs.err = ""
		return m, nil
	case key.Matches(msg, km.Back):
		if len(m.Brief.References) > 0 {
			m.Brief.References = m.Brief.References[:len(m.Brief.References)-1]
			return m, nil
		}
		m.Back()
		return m, nil
	case key.Matches(msg, km.Quit):
		return m, tea.Quit
	}
	var cmd tea.Cmd
	m.refs.input, cmd = m.refs.input.Update(msg)
	return m, cmd
}

func referencesView(m Model) string {
	theme := styles.NewTheme(m.Brief.Mood)
	styles.ConfigureTextInput(&m.refs.input, theme.Accent)

	title := theme.Title.Render("Referencias (opcional)")
	rule := styles.TitleUnderline(title, theme.Accent)

	var listed []string
	for i, r := range m.Brief.References {
		listed = append(listed, theme.Hint.Render(fmt.Sprintf("%d.", i+1))+styles.Gap(2)+theme.Value.Render(r))
	}
	list := lipgloss.JoinVertical(lipgloss.Left, listed...)

	errLine := ""
	if m.refs.err != "" {
		errLine = theme.ErrorBox.Render(m.refs.err)
	}

	hint := theme.Hint.Render("Enter agregar · Enter vacío avanzar · Tab saltar · Esc borrar última/volver")
	body := lipgloss.JoinVertical(lipgloss.Left,
		title,
		rule,
		theme.Hint.Render("Una URL por vez. Pegá y Enter. Enter vacío para avanzar."),
		"",
		list,
		"",
		theme.Input.Render(m.refs.input.View()),
		errLine,
		"",
		hint,
	)
	return styles.Page(body, m.width, m.height)
}
