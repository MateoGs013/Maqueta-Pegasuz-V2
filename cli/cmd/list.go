package cmd

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/MateoGs013/eros/cli/internal/projects"
)

var listCmd = &cobra.Command{
	Use:   "list",
	Short: "Listar proyectos existentes en ~/Desktop/",
	RunE: func(cmd *cobra.Command, args []string) error {
		ps, err := projects.Scan()
		if err != nil {
			return err
		}
		if len(ps) == 0 {
			fmt.Println("No hay proyectos de Eros en ~/Desktop/.")
			fmt.Println("Usá `eros new` para crear uno.")
			return nil
		}
		for _, p := range ps {
			progress := ""
			if p.SectionsTotal > 0 {
				progress = fmt.Sprintf("  %d/%d sections", p.SectionsDone, p.SectionsTotal)
			}
			phase := p.Phase
			if phase == "" {
				phase = "?"
			}
			task := p.Task
			if task == "" {
				task = "(no task)"
			}
			fmt.Printf("● %-25s  phase %s  %s%s\n", p.Slug, phase, task, progress)
		}
		return nil
	},
}

func init() {
	rootCmd.AddCommand(listCmd)
}
