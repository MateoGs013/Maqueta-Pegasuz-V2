package wizard

import (
	"strings"

	"github.com/charmbracelet/bubbles/key"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"github.com/MateoGs013/eros/cli/internal/brief"
	"github.com/MateoGs013/eros/cli/internal/paths"
	"github.com/MateoGs013/eros/cli/internal/tui/keys"
	"github.com/MateoGs013/eros/cli/internal/tui/styles"
)

func summaryUpdate(m Model, msg tea.KeyMsg) (Model, tea.Cmd) {
	km := keys.Default()
	switch {
	case key.Matches(msg, km.Enter):
		brief.ApplyDerivations(&m.Brief, m.Brief.SeedFamilies)
		m.step = stepExec
		return m, tea.Batch(startExecCmd(m.Brief), m.exec.spinner.Tick)
	case key.Matches(msg, km.Back):
		m.Back()
		return m, nil
	case msg.String() == "e", msg.String() == "E":
		m.step = stepName
		return m, nil
	case key.Matches(msg, km.Quit):
		return m, tea.Quit
	}
	return m, nil
}

func summaryView(m Model) string {
	theme := styles.NewTheme(m.Brief.Mood)
	title := theme.Title.Render("Listo para crear")
	rule := styles.TitleUnderline(title, theme.Accent)

	projectDir, _ := paths.ProjectDir(m.Brief.Slug)

	rows := [][2]string{
		{"Proyecto", m.Brief.Name + "  (" + m.Brief.Slug + ")"},
		{"Tipo", m.Brief.Type},
		{"Mood", m.Brief.Mood + " · " + m.Brief.Scheme},
		{"Páginas", strings.Join(m.Brief.Pages, ", ")},
		{"Modo", m.Brief.Mode},
		{"Referencias", countOrDash(len(m.Brief.References), "URLs")},
		{"Constraints", countOrDash(len(m.Brief.Constraints), "reglas")},
		{"Banned", countOrDash(len(m.Brief.BannedSeeds), "seeds")},
		{"Destino", projectDir},
	}

	var lines []string
	for _, r := range rows {
		lines = append(lines, theme.Label.Render(r[0])+styles.Gap(2)+theme.Value.Render(r[1]))
	}

	hint := theme.Hint.Render("[Enter] crear · [E] editar · [Ctrl+S] guardar template · [Esc] volver")
	body := lipgloss.JoinVertical(lipgloss.Left,
		append([]string{title, rule, ""}, append(lines, "", hint)...)...,
	)
	return styles.Page(body, m.width, m.height)
}

func countOrDash(n int, label string) string {
	if n == 0 {
		return "—"
	}
	return itoa(n) + " " + label
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	neg := ""
	if n < 0 {
		neg = "-"
		n = -n
	}
	var buf [20]byte
	i := len(buf)
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	return neg + string(buf[i:])
}
