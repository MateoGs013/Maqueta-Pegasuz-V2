package wizard

import (
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"github.com/MateoGs013/eros/cli/internal/paths"
	"github.com/MateoGs013/eros/cli/internal/runner"
	"github.com/MateoGs013/eros/cli/internal/tui/styles"
)

// LaunchIntent carries the post-wizard handoff instruction to cmd/new.go.
type LaunchIntent struct {
	ProjectDir    string
	InitialPrompt string
}

func launchUpdate(m Model, msg tea.KeyMsg) (Model, tea.Cmd) {
	projectDir, _ := paths.ProjectDir(m.Brief.Slug)
	initialPrompt := "nuevo proyecto"

	switch msg.String() {
	case "y", "Y", "enter":
		m.launchIntent = &LaunchIntent{ProjectDir: projectDir, InitialPrompt: initialPrompt}
		return m, tea.Sequence(tea.ExitAltScreen, tea.Quit)
	case "n", "N":
		return m, tea.Sequence(tea.ExitAltScreen, tea.Quit)
	case "c", "C":
		_ = runner.CopyText(runner.LaunchCommand(projectDir, initialPrompt))
		return m, tea.Sequence(tea.ExitAltScreen, tea.Quit)
	case "q", "ctrl+c":
		return m, tea.Quit
	}
	return m, nil
}

func launchView(m Model) string {
	theme := styles.NewTheme(m.Brief.Mood)
	title := theme.Title.Render("✓ Proyecto listo.")
	rule := styles.TitleUnderline(title, theme.Accent)

	projectDir, _ := paths.ProjectDir(m.Brief.Slug)
	pathLine := theme.Hint.Render("destino: ") + theme.Value.Render(projectDir)

	_, err := runner.FindClaude()
	claudeAvail := err == nil

	var options string
	if claudeAvail {
		options = lipgloss.JoinVertical(lipgloss.Left,
			theme.Label.Render("[Y]")+styles.Gap(2)+theme.Value.Bold(true).Render("abrir Claude ahora")+styles.Gap(2)+theme.Hint.Render("(default)"),
			theme.Label.Render("[n]")+styles.Gap(2)+theme.Value.Render("solo crear, lo abro yo después"),
			theme.Label.Render("[c]")+styles.Gap(2)+theme.Value.Render("copiar comando al clipboard"),
		)
	} else {
		warn := theme.ErrorBox.Render("claude no está en PATH · instalá con `npm i -g @anthropic-ai/claude-code`")
		options = lipgloss.JoinVertical(lipgloss.Left,
			warn,
			"",
			theme.Label.Render("[c]")+styles.Gap(2)+theme.Value.Bold(true).Render("copiar comando al clipboard"),
			theme.Label.Render("[n]")+styles.Gap(2)+theme.Value.Render("salir sin abrir"),
		)
	}

	body := lipgloss.JoinVertical(lipgloss.Left,
		title,
		rule,
		pathLine,
		"",
		theme.Value.Render("¿Arranco la magia?"),
		"",
		options,
	)
	return styles.Page(body, m.width, m.height)
}
