package styles

import "github.com/charmbracelet/lipgloss"

// logoLines — "EROS" figlet dollar-style. 8 rows × 40 cols.
// Diseño editorial compacto, pensado para hero centrado en background negro.
var logoLines = []string{
	` /$$$$$$$$ /$$$$$$$   /$$$$$$   /$$$$$$ `,
	`| $$_____/| $$__  $$ /$$__  $$ /$$__  $$`,
	`| $$      | $$  \ $$| $$  \ $$| $$  \__/`,
	`| $$$$$   | $$$$$$$/| $$  | $$|  $$$$$$ `,
	`| $$__/   | $$__  $$| $$  | $$ \____  $$`,
	`| $$      | $$  \ $$| $$  | $$ /$$  \ $$`,
	`| $$$$$$$$| $$  | $$|  $$$$$$/|  $$$$$$/`,
	`|________/|__/  |__/ \______/  \______/ `,
}

// decorationDots — linea decorativa de "puntitos facheros" para top y bottom.
// Matcheado al width del logo (~40 cols).
const decorationDots = "·   ·   ·   ·   ·   ·   ·   ·   ·   ·"

// Logo renderiza el bloque completo — logo + line-dots decoration.
func Logo(accent lipgloss.Color) string {
	logoStyle := lipgloss.NewStyle().
		Foreground(accent).
		Background(NearBlack).
		Bold(true)

	dotsStyle := lipgloss.NewStyle().
		Foreground(BorderSubtle).
		Background(NearBlack)

	out := ""
	for _, line := range logoLines {
		out += logoStyle.Render(line) + "\n"
	}
	out = dotsStyle.Render(decorationDots) + "\n\n" + out + "\n" + dotsStyle.Render(decorationDots)
	return out
}

// LogoSmall — variante compacta one-line para headers y splash pequeñas.
func LogoSmall(accent lipgloss.Color) string {
	return lipgloss.NewStyle().
		Foreground(accent).
		Background(NearBlack).
		Bold(true).
		Render("·  E R O S  ·")
}
