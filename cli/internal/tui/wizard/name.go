package wizard

import (
	"github.com/charmbracelet/bubbles/key"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"github.com/MateoGs013/eros/cli/internal/slug"
	"github.com/MateoGs013/eros/cli/internal/tui/keys"
	"github.com/MateoGs013/eros/cli/internal/tui/styles"
)

type nameState struct {
	input     textinput.Model
	editSlug  bool
	slugInput textinput.Model
}

func nameInit() nameState {
	ti := textinput.New()
	ti.Placeholder = "Northstar Atelier"
	ti.CharLimit = 80
	ti.Width = 50
	ti.Focus()

	si := textinput.New()
	si.Placeholder = "northstar-atelier"
	si.CharLimit = 60
	si.Width = 50

	return nameState{input: ti, slugInput: si}
}

func nameUpdate(m Model, msg tea.KeyMsg) (Model, tea.Cmd) {
	km := keys.Default()
	switch {
	case key.Matches(msg, km.Enter):
		name := m.name.input.Value()
		if name == "" {
			return m, nil
		}
		m.Brief.Name = name
		m.Brief.Slug = slug.Slugify(name)
		m.Advance()
		if m.step == stepSlug {
			m.name.slugInput.SetValue(m.Brief.Slug)
			m.name.slugInput.Focus()
		}
		return m, nil
	case key.Matches(msg, km.Edit):
		m.step = stepSlug
		m.name.slugInput.SetValue(m.Brief.Slug)
		m.name.slugInput.Focus()
		return m, nil
	case key.Matches(msg, km.Back), key.Matches(msg, km.Quit):
		m.step = stepTemplateLoader
		return m, nil
	}

	var cmd tea.Cmd
	m.name.input, cmd = m.name.input.Update(msg)
	return m, cmd
}

func slugUpdate(m Model, msg tea.KeyMsg) (Model, tea.Cmd) {
	km := keys.Default()
	switch {
	case key.Matches(msg, km.Enter):
		val := m.name.slugInput.Value()
		if val == "" {
			return m, nil
		}
		m.Brief.Slug = slug.Slugify(val)
		m.step = stepType
		return m, nil
	case key.Matches(msg, km.Back):
		m.step = stepName
		return m, nil
	case key.Matches(msg, km.Quit):
		return m, tea.Quit
	}
	var cmd tea.Cmd
	m.name.slugInput, cmd = m.name.slugInput.Update(msg)
	return m, cmd
}

func nameView(m Model) string {
	theme := styles.NewTheme(m.Brief.Mood)
	styles.ConfigureTextInput(&m.name.input, theme.Accent)

	title := theme.Title.Render("Nombre del proyecto")
	rule := styles.TitleUnderline(title, theme.Accent)
	hint := theme.Hint.Render("Enter confirmar · Ctrl+E forzar editar slug · Esc volver")

	preview := ""
	if m.name.input.Value() != "" {
		preview = theme.Hint.Render("slug: ") + theme.Value.Render(slug.Slugify(m.name.input.Value()))
	}

	body := lipgloss.JoinVertical(lipgloss.Left,
		title,
		rule,
		"",
		theme.Input.Render(m.name.input.View()),
		"",
		preview,
		"",
		hint,
	)
	return styles.Page(body, m.width, m.height)
}

func slugView(m Model) string {
	theme := styles.NewTheme(m.Brief.Mood)
	styles.ConfigureTextInput(&m.name.slugInput, theme.Accent)

	title := theme.Title.Render("Slug (ajustá si hace falta)")
	rule := styles.TitleUnderline(title, theme.Accent)
	warn := theme.Hint.Render("⚠ ya existe un proyecto con este slug")
	hint := theme.Hint.Render("Enter confirmar · Esc volver")

	body := lipgloss.JoinVertical(lipgloss.Left,
		title,
		rule,
		warn,
		"",
		theme.Input.Render(m.name.slugInput.View()),
		"",
		hint,
	)
	return styles.Page(body, m.width, m.height)
}
