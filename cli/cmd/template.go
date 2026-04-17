package cmd

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/MateoGs013/eros/cli/internal/templates"
)

var templateCmd = &cobra.Command{
	Use:   "template",
	Short: "Gestionar templates de briefs",
}

var templateListCmd = &cobra.Command{
	Use:   "list",
	Short: "Listar templates guardados",
	RunE: func(cmd *cobra.Command, args []string) error {
		names, err := templates.List()
		if err != nil {
			return err
		}
		if len(names) == 0 {
			fmt.Println("No hay templates guardados.")
			fmt.Println("Dentro del wizard, usá Ctrl+S para guardar el brief actual.")
			return nil
		}
		for _, n := range names {
			fmt.Println(n)
		}
		return nil
	},
}

var templateDeleteCmd = &cobra.Command{
	Use:   "delete <name>",
	Short: "Borrar un template",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		if err := templates.Delete(args[0]); err != nil {
			return err
		}
		fmt.Printf("Template %q borrado.\n", args[0])
		return nil
	},
}

func init() {
	templateCmd.AddCommand(templateListCmd)
	templateCmd.AddCommand(templateDeleteCmd)
	rootCmd.AddCommand(templateCmd)
}
