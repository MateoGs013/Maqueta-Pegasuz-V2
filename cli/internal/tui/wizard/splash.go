package wizard

import (
	"strings"

	"github.com/charmbracelet/bubbles/key"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"github.com/MateoGs013/eros/cli/internal/tui/keys"
	"github.com/MateoGs013/eros/cli/internal/tui/styles"
)

func splashUpdate(m Model, msg tea.KeyMsg) (Model, tea.Cmd) {
	km := keys.Default()
	switch {
	case key.Matches(msg, km.Enter), msg.String() == "n", msg.String() == "N":
		m.step = stepTemplateLoader
		return m, nil
	case key.Matches(msg, km.Quit):
		return m, tea.Quit
	}
	return m, nil
}

func splashView(m Model) string {
	theme := styles.NewTheme(m.Brief.Mood)
	accent := theme.Accent
	bg := styles.NearBlack

	logo := styles.Logo(accent)

	keyStyle := lipgloss.NewStyle().Foreground(accent).Background(bg).Bold(true)
	descStyle := lipgloss.NewStyle().Foreground(styles.WarmWhite).Background(bg)
	softStyle := lipgloss.NewStyle().Foreground(styles.MutedGray).Background(bg).Faint(true)

	menuItem := func(k, desc, hint string) string {
		gap := lipgloss.NewStyle().Background(bg).Render("   ")
		line := keyStyle.Render("["+k+"]") + gap + descStyle.Render(desc)
		if hint != "" {
			line += gap + softStyle.Render(hint)
		}
		return line
	}
	menu := strings.Join([]string{
		menuItem("N", "nuevo proyecto", ""),
		menuItem("R", "resume", "· próximamente"),
		menuItem("L", "proyectos", "· próximamente"),
		menuItem("Q", "salir", ""),
	}, "\n")

	footer := softStyle.Render("Enter · nuevo proyecto      Q · salir")

	body := strings.Join([]string{
		logo,
		"",
		"",
		menu,
		"",
		"",
		footer,
	}, "\n")

	return styles.Page(body, m.width, m.height)
}
