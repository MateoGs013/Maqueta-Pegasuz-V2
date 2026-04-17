package cmd

import (
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "eros",
	Short: "Eros — director creativo autónomo",
	Long:  "CLI para iniciar proyectos con el pipeline de Eros.\n\nEjecutar sin argumentos abre el wizard fullscreen.",
	RunE: func(cmd *cobra.Command, args []string) error {
		// Default behavior: open the wizard (same as `eros new`).
		return runNew(cmd, args)
	},
}

func Execute(version string) error {
	rootCmd.Version = version
	return rootCmd.Execute()
}
