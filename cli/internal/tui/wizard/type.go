package wizard

import (
	"github.com/charmbracelet/bubbles/key"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"github.com/MateoGs013/eros/cli/internal/tui/keys"
	"github.com/MateoGs013/eros/cli/internal/tui/styles"
)

var types = []struct {
	ID    string
	Label string
	Hint  string
}{
	{"creative-studio", "Creative studio", "Boutique digital / brand studio"},
	{"product-saas", "Product / SaaS", "App or platform with product surface"},
	{"brutalist-editorial", "Brutalist editorial", "Bold, poster-like, typography-led"},
	{"luxury-brand", "Luxury brand", "Premium, refined, restrained"},
	{"dashboard-app", "Dashboard / app", "Data-dense interactive app"},
	{"portfolio", "Portfolio", "Personal or studio showcase"},
	{"agency", "Agency", "Services + case studies"},
	{"ecommerce-boutique", "E-commerce boutique", "Editorial commerce with product focus"},
}

type typeState struct{ cursor int }

func typeInit(m *Model) {
	m.typeS = typeState{cursor: 0}
	for i, t := range types {
		if t.ID == m.Brief.Type {
			m.typeS.cursor = i
			return
		}
	}
}

func typeUpdate(m Model, msg tea.KeyMsg) (Model, tea.Cmd) {
	km := keys.Default()
	switch {
	case key.Matches(msg, km.Up):
		if m.typeS.cursor > 0 {
			m.typeS.cursor--
		}
	case key.Matches(msg, km.Down):
		if m.typeS.cursor < len(types)-1 {
			m.typeS.cursor++
		}
	case key.Matches(msg, km.Enter):
		m.Brief.Type = types[m.typeS.cursor].ID
		m.Advance()
	case key.Matches(msg, km.Back):
		m.Back()
	case key.Matches(msg, km.Quit):
		return m, tea.Quit
	}
	return m, nil
}

func typeView(m Model) string {
	theme := styles.NewTheme(m.Brief.Mood)
	title := theme.Title.Render("Tipo de proyecto")
	rule := styles.TitleUnderline(title, theme.Accent)

	var lines []string
	for i, t := range types {
		prefix := theme.Unselected.String()
		line := theme.Value.Render(t.Label)
		if i == m.typeS.cursor {
			prefix = theme.Selected.String()
			line = theme.Value.Bold(true).Render(t.Label) + styles.Gap(2) + theme.Hint.Render(t.Hint)
		}
		lines = append(lines, prefix+line)
	}

	hint := theme.Hint.Render("↑↓ navegar · Enter pick · Esc volver")
	body := lipgloss.JoinVertical(lipgloss.Left, append([]string{title, rule, ""}, lines...)...)
	body += "\n\n" + hint
	return styles.Page(body, m.width, m.height)
}
