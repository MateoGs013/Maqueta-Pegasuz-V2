package styles

import "github.com/charmbracelet/lipgloss"

// Palette — rich near-blacks and warm whites per EROS.md.
// Never pure #000 / #fff.
var (
	NearBlack    = lipgloss.Color("#0a0a0f")
	WarmWhite    = lipgloss.Color("#fafaf7")
	MutedGray    = lipgloss.Color("#6b6a64")
	SoftGray     = lipgloss.Color("#9a988f")
	BorderSubtle = lipgloss.Color("#2a2a30")
	Danger       = lipgloss.Color("#c1554a")
	Success      = lipgloss.Color("#7d9474")
)

// Mood accents — tint the UI based on the mood the user is picking.
var moodAccents = map[string]lipgloss.Color{
	"Dark cinematic editorial": lipgloss.Color("#d4a24c"), // amber
	"Brutalist bold":           lipgloss.Color("#c54a3a"), // red
	"Luxury refined":           lipgloss.Color("#b8934f"), // gold
	"Product UI":               lipgloss.Color("#7b6fb0"), // violet
}

const defaultAccent = "#d4a24c"

// Accent returns the accent color for a mood label. Falls back to amber.
func Accent(mood string) lipgloss.Color {
	if c, ok := moodAccents[mood]; ok {
		return c
	}
	return lipgloss.Color(defaultAccent)
}

// Theme groups pre-built styles tinted with the current mood accent. Every
// style carries Background(NearBlack) so rendered fragments blend into the
// full-bleed Page chrome without color bleed.
type Theme struct {
	Accent lipgloss.Color

	Title      lipgloss.Style
	Subtitle   lipgloss.Style
	Label      lipgloss.Style
	Value      lipgloss.Style
	Hint       lipgloss.Style
	Selected   lipgloss.Style
	Unselected lipgloss.Style
	Input      lipgloss.Style
	PreviewBox lipgloss.Style
	ErrorBox   lipgloss.Style
	Spinner    lipgloss.Style
}

// NewTheme builds styles tinted with the given mood accent.
func NewTheme(mood string) Theme {
	accent := Accent(mood)

	return Theme{
		Accent: accent,
		Title: lipgloss.NewStyle().
			Foreground(WarmWhite).
			Background(NearBlack).
			Bold(true),
		Subtitle: lipgloss.NewStyle().
			Foreground(SoftGray).
			Background(NearBlack).
			Italic(true),
		Label: lipgloss.NewStyle().
			Foreground(MutedGray).
			Background(NearBlack),
		Value: lipgloss.NewStyle().
			Foreground(WarmWhite).
			Background(NearBlack),
		Hint: lipgloss.NewStyle().
			Foreground(MutedGray).
			Background(NearBlack).
			Faint(true),
		Selected: lipgloss.NewStyle().
			Foreground(accent).
			Background(NearBlack).
			Bold(true).
			SetString("❯ "),
		Unselected: lipgloss.NewStyle().
			Foreground(SoftGray).
			Background(NearBlack).
			SetString("  "),
		Input: lipgloss.NewStyle().
			Foreground(WarmWhite).
			Background(NearBlack).
			Border(lipgloss.RoundedBorder()).
			BorderForeground(accent).
			BorderBackground(NearBlack).
			Padding(0, 1),
		PreviewBox: lipgloss.NewStyle().
			Background(NearBlack).
			Border(lipgloss.RoundedBorder()).
			BorderForeground(accent).
			BorderBackground(NearBlack).
			Padding(1, 2),
		ErrorBox: lipgloss.NewStyle().
			Background(NearBlack).
			Border(lipgloss.ThickBorder()).
			BorderForeground(Danger).
			BorderBackground(NearBlack).
			Padding(1, 2).
			Foreground(Danger),
		Spinner: lipgloss.NewStyle().
			Foreground(accent).
			Background(NearBlack),
	}
}
