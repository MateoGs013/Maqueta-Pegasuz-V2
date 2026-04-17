package wizard

import (
	"github.com/charmbracelet/bubbles/key"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"github.com/MateoGs013/eros/cli/internal/runner"
	"github.com/MateoGs013/eros/cli/internal/tui/keys"
	"github.com/MateoGs013/eros/cli/internal/tui/styles"
)

func errorUpdate(m Model, msg tea.KeyMsg) (Model, tea.Cmd) {
	km := keys.Default()
	switch {
	case msg.String() == "r", msg.String() == "R":
		m.step = stepExec
		m.exec.logs = nil
		return m, startExecCmd(m.Brief)
	case msg.String() == "e", msg.String() == "E":
		m.step = stepSummary
		return m, nil
	case key.Matches(msg, km.Copy):
		_ = runner.CopyText(m.lastErr.Error())
	case key.Matches(msg, km.Quit):
		return m, tea.Quit
	}
	return m, nil
}

func errorView(m Model) string {
	theme := styles.NewTheme(m.Brief.Mood)
	title := theme.Title.Render("Falló la creación del proyecto")
	rule := styles.TitleUnderline(title, styles.Danger)

	errBox := theme.ErrorBox.Render(m.lastErr.Error())

	hint := theme.Hint.Render("[R] reintentar · [E] editar brief · [Ctrl+Y] copiar error · [Q] salir")

	body := lipgloss.JoinVertical(lipgloss.Left,
		title,
		rule,
		"",
		errBox,
		"",
		hint,
	)
	return styles.Page(body, m.width, m.height)
}
