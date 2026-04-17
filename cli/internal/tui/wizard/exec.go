package wizard

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/charmbracelet/bubbles/spinner"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"github.com/MateoGs013/eros/cli/internal/brief"
	"github.com/MateoGs013/eros/cli/internal/paths"
	"github.com/MateoGs013/eros/cli/internal/runner"
	"github.com/MateoGs013/eros/cli/internal/tui/styles"
)

type execState struct {
	spinner spinner.Model
	logs    []string
	done    bool
	err     error
}

func execInit() execState {
	s := spinner.New()
	s.Spinner = spinner.Spinner{
		Frames: []string{"⣷", "⣯", "⣟", "⡿", "⢿", "⣻", "⣽", "⣾"},
		FPS:    time.Second / 10,
	}
	return execState{spinner: s}
}

type execLineMsg string
type execDoneMsg struct{ err error }

// startExecCmd writes intake.json to temp and runs init-project.mjs.
// The wizard passes --skip-install so the exec step completes in a few seconds
// (scaffold copy + bootstrap + intake persist). npm install is deferred: the
// launch step runs it visibly before handing off to Claude so users see real
// progress instead of a silently spinning wizard for minutes.
func startExecCmd(b brief.Brief) tea.Cmd {
	return func() tea.Msg {
		tempDir := os.TempDir()
		intakePath := filepath.Join(tempDir, fmt.Sprintf("eros-intake-%s-%d.json", b.Slug, time.Now().Unix()))
		data, err := json.MarshalIndent(b, "", "  ")
		if err != nil {
			return execDoneMsg{err: fmt.Errorf("serializar intake: %w", err)}
		}
		if err := os.WriteFile(intakePath, data, 0o644); err != nil {
			return execDoneMsg{err: fmt.Errorf("escribir intake a %s: %w", intakePath, err)}
		}

		projectDir, err := paths.ProjectDir(b.Slug)
		if err != nil {
			return execDoneMsg{err: fmt.Errorf("resolver project dir: %w", err)}
		}

		err = runner.RunNodeScript(context.Background(), runner.NodeOptions{
			ScriptRel: []string{"pipeline", "init-project.mjs"},
			Args: []string{
				"--brief-file", intakePath,
				"--project", projectDir,
				"--skip-install",
			},
		})
		if err != nil {
			return execDoneMsg{err: fmt.Errorf("init-project.mjs: %w", err)}
		}
		return execDoneMsg{err: nil}
	}
}

func execUpdate(m Model, msg tea.Msg) (Model, tea.Cmd) {
	switch msg := msg.(type) {
	case spinner.TickMsg:
		var cmd tea.Cmd
		m.exec.spinner, cmd = m.exec.spinner.Update(msg)
		return m, cmd
	case execLineMsg:
		m.exec.logs = append(m.exec.logs, string(msg))
		if len(m.exec.logs) > 20 {
			m.exec.logs = m.exec.logs[len(m.exec.logs)-20:]
		}
	case execDoneMsg:
		m.exec.done = true
		m.exec.err = msg.err
		if msg.err != nil {
			m.GoToError(msg.err)
			return m, nil
		}
		m.step = stepLaunch
		return m, nil
	}
	return m, nil
}

func execView(m Model) string {
	theme := styles.NewTheme(m.Brief.Mood)
	styles.ConfigureSpinner(&m.exec.spinner, theme.Accent)

	title := theme.Title.Render("Creando " + m.Brief.Slug)
	rule := styles.TitleUnderline(title, theme.Accent)

	start := len(m.exec.logs) - 5
	if start < 0 {
		start = 0
	}
	var lastLines []string
	for _, l := range m.exec.logs[start:] {
		lastLines = append(lastLines, theme.Hint.Render("│ ")+theme.Value.Render(l))
	}

	spinnerLine := theme.Spinner.Render(m.exec.spinner.View()) + styles.Gap(2) + theme.Value.Render("copiando scaffold + bootstrap de .eros/ …")

	parts := []string{title, rule, "", spinnerLine, ""}
	parts = append(parts, lastLines...)
	body := lipgloss.JoinVertical(lipgloss.Left, parts...)
	return styles.Page(body, m.width, m.height)
}
