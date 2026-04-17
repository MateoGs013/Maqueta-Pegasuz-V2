package wizard

import (
	"github.com/charmbracelet/bubbles/key"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"github.com/MateoGs013/eros/cli/internal/tui/keys"
	"github.com/MateoGs013/eros/cli/internal/tui/styles"
)

type advancedField int

const (
	fAudience advancedField = iota
	fDescription
	fPromptSummary
	fBrand
	fBackend
	advancedCount
)

var advancedLabels = []string{"Audience", "Description", "Prompt summary", "Brand", "Backend"}

type advancedState struct {
	cursor   advancedField
	inputs   [advancedCount]textinput.Model
	prevStep step
}

func advancedInit(m *Model) {
	var inputs [advancedCount]textinput.Model
	for i := range inputs {
		ti := textinput.New()
		ti.CharLimit = 200
		inputs[i] = ti
	}
	inputs[fAudience].SetValue(m.Brief.Audience)
	inputs[fDescription].SetValue(m.Brief.Description)
	inputs[fPromptSummary].SetValue(m.Brief.PromptSummary)
	inputs[fBrand].SetValue(m.Brief.Brand)
	inputs[fBackend].SetValue(m.Brief.Backend)

	m.advanced = advancedState{inputs: inputs}
}

// OpenAdvanced is called from the global key handler on Ctrl+A.
func OpenAdvanced(m *Model) {
	m.advanced.prevStep = m.step
	m.advanced.inputs[m.advanced.cursor].Focus()
	m.step = stepAdvanced
}

func advancedUpdate(m Model, msg tea.KeyMsg) (Model, tea.Cmd) {
	km := keys.Default()
	switch {
	case key.Matches(msg, km.Up):
		m.advanced.inputs[m.advanced.cursor].Blur()
		if m.advanced.cursor > 0 {
			m.advanced.cursor--
		}
		m.advanced.inputs[m.advanced.cursor].Focus()
	case key.Matches(msg, km.Down):
		m.advanced.inputs[m.advanced.cursor].Blur()
		if m.advanced.cursor < advancedCount-1 {
			m.advanced.cursor++
		}
		m.advanced.inputs[m.advanced.cursor].Focus()
	case key.Matches(msg, km.Enter):
		m.Brief.Audience = m.advanced.inputs[fAudience].Value()
		m.Brief.Description = m.advanced.inputs[fDescription].Value()
		m.Brief.PromptSummary = m.advanced.inputs[fPromptSummary].Value()
		m.Brief.Brand = m.advanced.inputs[fBrand].Value()
		m.Brief.Backend = m.advanced.inputs[fBackend].Value()
		m.step = m.advanced.prevStep
		return m, nil
	case key.Matches(msg, km.Back):
		m.step = m.advanced.prevStep
		return m, nil
	}
	var cmd tea.Cmd
	m.advanced.inputs[m.advanced.cursor], cmd = m.advanced.inputs[m.advanced.cursor].Update(msg)
	return m, cmd
}

func advancedView(m Model) string {
	theme := styles.NewTheme(m.Brief.Mood)
	for i := range m.advanced.inputs {
		styles.ConfigureTextInput(&m.advanced.inputs[i], theme.Accent)
	}

	title := theme.Title.Render("Advanced — defaults y overrides")
	rule := styles.TitleUnderline(title, theme.Accent)

	var lines []string
	for i, label := range advancedLabels {
		var prefix string
		if advancedField(i) == m.advanced.cursor {
			prefix = theme.Selected.String()
		} else {
			prefix = theme.Unselected.String()
		}
		lines = append(lines,
			prefix+theme.Label.Render(label),
			theme.Input.Render(m.advanced.inputs[i].View()),
			"",
		)
	}

	hint := theme.Hint.Render("↑↓ campo · Enter commit y cerrar · Esc cancelar")
	body := lipgloss.JoinVertical(lipgloss.Left, append([]string{title, rule, ""}, append(lines, hint)...)...)
	return styles.Page(body, m.width, m.height)
}
