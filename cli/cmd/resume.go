package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"

	"github.com/MateoGs013/eros/cli/internal/projects"
	"github.com/MateoGs013/eros/cli/internal/runner"
)

var resumeCmd = &cobra.Command{
	Use:   "resume [slug]",
	Short: "Abrir Claude en un proyecto existente",
	Args:  cobra.MaximumNArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		ps, err := projects.Scan()
		if err != nil {
			return err
		}
		if len(ps) == 0 {
			return fmt.Errorf("no hay proyectos — usá `eros new`")
		}

		if len(args) == 0 {
			fmt.Fprintln(os.Stderr, "especificá el slug del proyecto:")
			for _, p := range ps {
				fmt.Fprintln(os.Stderr, " ", p.Slug)
			}
			return fmt.Errorf("slug no especificado")
		}

		slug := args[0]
		for _, p := range ps {
			if p.Slug == slug {
				return runner.LaunchClaude(p.Path, "continuar proyecto")
			}
		}
		return fmt.Errorf("proyecto %q no encontrado", slug)
	},
}

func init() {
	rootCmd.AddCommand(resumeCmd)
}
