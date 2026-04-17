package cmd

import (
	"fmt"
	"os"
	"os/exec"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/spf13/cobra"

	"github.com/MateoGs013/eros/cli/internal/moods"
	"github.com/MateoGs013/eros/cli/internal/projects"
	"github.com/MateoGs013/eros/cli/internal/runner"
	"github.com/MateoGs013/eros/cli/internal/tui/wizard"
)

var newCmd = &cobra.Command{
	Use:   "new",
	Short: "Crear un proyecto nuevo con el wizard",
	Long:  "Abre el wizard fullscreen para configurar y crear un proyecto nuevo.",
	RunE:  runNew,
}

func runNew(cmd *cobra.Command, args []string) error {
	// Load mood profiles from export-moods.mjs. If unavailable, continue with
	// empty profiles — the wizard will still function for text-only selection.
	profiles, err := moods.Load()
	if err != nil {
		fmt.Fprintln(os.Stderr, "[warn] no pude cargar mood profiles:", err)
	}

	model := wizard.New(wizard.Options{
		Profiles: profiles,
		ExistsFn: projects.Exists,
	})

	p := tea.NewProgram(model, tea.WithAltScreen())
	finalModel, err := p.Run()
	if err != nil {
		return fmt.Errorf("wizard: %w", err)
	}

	wm, ok := finalModel.(wizard.Model)
	if !ok {
		return fmt.Errorf("wizard returned unexpected model type")
	}

	intent := wm.LaunchIntent()
	if intent == nil {
		// User chose "solo crear, no abrir" or canceled.
		fmt.Println()
		fmt.Println("Proyecto creado. Para abrir Claude manualmente:")
		return nil
	}

	// Post-wizard: run npm install visibly in the project dir so the user sees
	// real progress instead of a silently spinning wizard for minutes. We
	// skip-installed during exec to keep the wizard snappy; install happens here.
	fmt.Println()
	fmt.Println("· instalando dependencias (npm install)…")
	fmt.Println()
	if err := runNpmInstall(intent.ProjectDir); err != nil {
		fmt.Fprintln(os.Stderr, "npm install falló:", err)
		fmt.Fprintln(os.Stderr, "el proyecto está creado pero sin node_modules — corré `npm install` adentro manualmente.")
		// Continue to claude launch anyway; user can resolve deps later.
	}

	fmt.Println()
	fmt.Println("· abriendo Claude…")
	fmt.Println()
	if err := runner.LaunchClaude(intent.ProjectDir, intent.InitialPrompt); err != nil {
		fmt.Fprintln(os.Stderr, "no pude lanzar claude:", err)
		fmt.Println("Pegá este comando en otra terminal:")
		fmt.Println(" ", runner.LaunchCommand(intent.ProjectDir, intent.InitialPrompt))
		return err
	}
	return nil
}

// runNpmInstall spawns npm install in the given project directory with
// inherited stdio so the user sees real-time progress. Windows requires
// shell:true equivalent via cmd.exe since npm is a .cmd shim.
func runNpmInstall(projectDir string) error {
	var c *exec.Cmd
	if osIsWindows() {
		c = exec.Command("cmd", "/c", "npm", "install")
	} else {
		c = exec.Command("npm", "install")
	}
	c.Dir = projectDir
	c.Stdin = os.Stdin
	c.Stdout = os.Stdout
	c.Stderr = os.Stderr
	return c.Run()
}

func osIsWindows() bool {
	return os.PathSeparator == '\\'
}

func init() {
	rootCmd.AddCommand(newCmd)
}
