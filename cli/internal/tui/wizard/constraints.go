package wizard

import (
	"fmt"

	"github.com/charmbracelet/bubbles/key"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"github.com/MateoGs013/eros/cli/internal/tui/keys"
	"github.com/MateoGs013/eros/cli/internal/tui/styles"
)

type constraintsState struct {
	input textinput.Model
}

func constraintsInit() constraintsState {
	ti := textinput.New()
	ti.Placeholder = "evitá patrones de SaaS dashboard"
	ti.CharLimit = 200
	ti.Focus()
	return constraintsState{input: ti}
}

func constraintsUpdate(m Model, msg tea.KeyMsg) (Model, tea.Cmd) {
	km := keys.Default()
	switch {
	case key.Matches(msg, km.Tab):
		m.Advance()
		return m, nil
	case key.Matches(msg, km.Enter):
		val := m.constraints.input.Value()
		if val == "" {
			m.Advance()
			return m, nil
		}
		m.Brief.Constraints = append(m.Brief.Constraints, val)
		m.constraints.input.Reset()
		return m, nil
	case key.Matches(msg, km.Back):
		if len(m.Brief.Constraints) > 0 {
			m.Brief.Constraints = m.Brief.Constraints[:len(m.Brief.Constraints)-1]
			return m, nil
		}
		m.Back()
		return m, nil
	case key.Matches(msg, km.Quit):
		return m, tea.Quit
	}
	var cmd tea.Cmd
	m.constraints.input, cmd = m.constraints.input.Update(msg)
	return m, cmd
}

func constraintsView(m Model) string {
	theme := styles.NewTheme(m.Brief.Mood)
	styles.ConfigureTextInput(&m.constraints.input, theme.Accent)

	title := theme.Title.Render("Constraints (opcional)")
	rule := styles.TitleUnderline(title, theme.Accent)

	var listed []string
	for i, c := range m.Brief.Constraints {
		listed = append(listed, theme.Hint.Render(fmt.Sprintf("%d.", i+1))+styles.Gap(2)+theme.Value.Render(c))
	}
	list := lipgloss.JoinVertical(lipgloss.Left, listed...)

	hint := theme.Hint.Render("Enter agregar · Enter vacío avanzar · Tab saltar · Esc borrar última/volver")
	body := lipgloss.JoinVertical(lipgloss.Left,
		title,
		rule,
		theme.Hint.Render("Cosas a evitar o reglas duras. Una por vez."),
		"",
		list,
		"",
		theme.Input.Render(m.constraints.input.View()),
		"",
		hint,
	)
	return styles.Page(body, m.width, m.height)
}
