package wizard

import (
	"github.com/charmbracelet/bubbles/key"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"github.com/MateoGs013/eros/cli/internal/tui/keys"
	"github.com/MateoGs013/eros/cli/internal/tui/styles"
)

var standardPages = []string{"home", "work", "about", "contact", "services", "pricing", "blog"}

type pagesState struct {
	selected map[string]bool
	custom   []string
	cursor   int // 0..len(standardPages+custom)-1, then +add slot
	adding   bool
	addInput textinput.Model
}

func pagesInit(m *Model) {
	selected := map[string]bool{}
	if len(m.Brief.Pages) == 0 {
		for _, p := range []string{"home", "work", "about", "contact"} {
			selected[p] = true
		}
	} else {
		for _, p := range m.Brief.Pages {
			selected[p] = true
		}
	}
	ti := textinput.New()
	ti.Placeholder = "nueva página (kebab-case)"
	ti.CharLimit = 30

	m.pagesS = pagesState{selected: selected, addInput: ti}
}

func pagesAll(s pagesState) []string {
	out := append([]string{}, standardPages...)
	out = append(out, s.custom...)
	return out
}

func pagesUpdate(m Model, msg tea.KeyMsg) (Model, tea.Cmd) {
	km := keys.Default()

	if m.pagesS.adding {
		switch {
		case key.Matches(msg, km.Enter):
			name := m.pagesS.addInput.Value()
			if name != "" {
				m.pagesS.custom = append(m.pagesS.custom, name)
				m.pagesS.selected[name] = true
			}
			m.pagesS.adding = false
			m.pagesS.addInput.Reset()
			return m, nil
		case key.Matches(msg, km.Back):
			m.pagesS.adding = false
			return m, nil
		}
		var cmd tea.Cmd
		m.pagesS.addInput, cmd = m.pagesS.addInput.Update(msg)
		return m, cmd
	}

	all := pagesAll(m.pagesS)
	switch {
	case key.Matches(msg, km.Up):
		if m.pagesS.cursor > 0 {
			m.pagesS.cursor--
		}
	case key.Matches(msg, km.Down):
		if m.pagesS.cursor < len(all) { // extra slot for "+ agregar"
			m.pagesS.cursor++
		}
	case msg.String() == " ":
		if m.pagesS.cursor < len(all) {
			page := all[m.pagesS.cursor]
			m.pagesS.selected[page] = !m.pagesS.selected[page]
		}
	case key.Matches(msg, km.Enter):
		if m.pagesS.cursor == len(all) {
			m.pagesS.adding = true
			m.pagesS.addInput.Focus()
			return m, nil
		}
		pages := []string{}
		for _, p := range all {
			if m.pagesS.selected[p] {
				pages = append(pages, p)
			}
		}
		if len(pages) == 0 {
			pages = []string{"home"}
		}
		m.Brief.Pages = pages
		m.Advance()
	case key.Matches(msg, km.Back):
		m.Back()
	case key.Matches(msg, km.Quit):
		return m, tea.Quit
	}
	return m, nil
}

func pagesView(m Model) string {
	theme := styles.NewTheme(m.Brief.Mood)
	styles.ConfigureTextInput(&m.pagesS.addInput, theme.Accent)

	title := theme.Title.Render("Páginas")
	rule := styles.TitleUnderline(title, theme.Accent)
	hint := theme.Hint.Render("↑↓ navegar · Espacio toggle · Enter confirmar · Esc volver")

	all := pagesAll(m.pagesS)
	var lines []string
	for i, p := range all {
		check := "[ ]"
		if m.pagesS.selected[p] {
			check = "[×]"
		}
		prefix := theme.Unselected.String()
		line := theme.Value.Render(check + " " + p)
		if i == m.pagesS.cursor {
			prefix = theme.Selected.String()
			line = theme.Value.Bold(true).Render(check + " " + p)
		}
		lines = append(lines, prefix+line)
	}
	addPrefix := theme.Unselected.String()
	addLabel := theme.Hint.Render("+ agregar página custom")
	if m.pagesS.cursor == len(all) {
		addPrefix = theme.Selected.String()
		addLabel = theme.Value.Bold(true).Render("+ agregar página custom")
	}
	lines = append(lines, addPrefix+addLabel)

	if m.pagesS.adding {
		lines = append(lines, "", theme.Input.Render(m.pagesS.addInput.View()))
	}

	body := lipgloss.JoinVertical(lipgloss.Left, append([]string{title, rule, ""}, lines...)...)
	body += "\n\n" + hint
	return styles.Page(body, m.width, m.height)
}
