package wizard

import (
	"fmt"

	"github.com/charmbracelet/bubbles/key"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"github.com/MateoGs013/eros/cli/internal/tui/keys"
	"github.com/MateoGs013/eros/cli/internal/tui/styles"
)

type seed struct {
	Name string
	Desc string
}

var allSeeds = []seed{
	// Heroes (21)
	{"S-AmbientAtmosphere", "fog + grain, floating type, atmospheric depth"},
	{"S-ArtisanWarm", "warm tones, handcraft feel, editorial restraint"},
	{"S-BentoDashboard", "bento grid, product-led card composition"},
	{"S-BrutalistGrid", "hard grid, poster typography, no decoration"},
	{"S-CardDeckStack", "stacked cards with z-depth, scroll-linked shuffle"},
	{"S-CinematicCurtain", "curtain reveal, layered split, high drama"},
	{"S-ColorBlock", "bold color fields, minimal type, flat confidence"},
	{"S-DiagonalSlash", "diagonal separators, angled type, dynamic flow"},
	{"S-FloatingGlassHUD", "glassmorphism panels, HUD-style floating"},
	{"S-FullBleedOverlay", "full-bleed media with overlay type"},
	{"S-HorizontalFilmStrip", "horizontal scroll strip, cinematic frames"},
	{"S-KineticGrid", "motion-driven grid, cells animate on scroll"},
	{"S-MarqueeTicker", "marquee ticker, typographic loop, brand rhythm"},
	{"S-OrbitalShowcase", "orbital / circular layout, product feature ring"},
	{"S-ProductStage", "product on stage, spotlight focus, clean bg"},
	{"S-Scattered", "scattered layout, intentional chaos, editorial"},
	{"S-SplitScrollNarrative", "split viewport, parallel scroll narrative"},
	{"S-StackedPanels", "full-height panels stack on scroll"},
	{"S-TypeMonument", "single massive typographic monument"},
	{"S-TypographicCascade", "cascading type sizes, rhythm-led layout"},
	{"S-WorkMosaic", "mosaic work grid, varied proportions"},
	// Navs (10)
	{"N-BottomFixedPill", "bottom pill nav, mobile-first, floating"},
	{"N-Contextual", "contextual nav that reshapes per page"},
	{"N-FloatingPill", "floating pill nav, desktop-oriented"},
	{"N-FullscreenOverlay", "fullscreen overlay on toggle"},
	{"N-GlassBlur", "glass blur bar, sticky top"},
	{"N-HiddenReveal", "hidden on scroll, reveals on intent"},
	{"N-MicroShrink", "shrinks to compact on scroll"},
	{"N-MinimalHamburger", "minimal hamburger, mobile-first"},
	{"N-SideNavbar", "vertical sidebar nav, desktop-heavy"},
	{"N-SplitCorners", "logo one corner, menu the other"},
}

type bannedState struct {
	cursor   int
	selected map[string]bool
}

func bannedInit(m *Model) {
	sel := map[string]bool{}
	for _, s := range m.Brief.BannedSeeds {
		sel[s] = true
	}
	m.banned = bannedState{cursor: 0, selected: sel}
}

func bannedUpdate(m Model, msg tea.KeyMsg) (Model, tea.Cmd) {
	km := keys.Default()
	switch {
	case key.Matches(msg, km.Tab):
		m.Advance()
		return m, nil
	case key.Matches(msg, km.Up):
		if m.banned.cursor > 0 {
			m.banned.cursor--
		}
	case key.Matches(msg, km.Down):
		if m.banned.cursor < len(allSeeds)-1 {
			m.banned.cursor++
		}
	case msg.String() == " ":
		s := allSeeds[m.banned.cursor]
		m.banned.selected[s.Name] = !m.banned.selected[s.Name]
	case key.Matches(msg, km.Enter):
		banned := []string{}
		for _, s := range allSeeds {
			if m.banned.selected[s.Name] {
				banned = append(banned, s.Name)
			}
		}
		m.Brief.BannedSeeds = banned
		m.Advance()
	case key.Matches(msg, km.Back):
		m.Back()
	case key.Matches(msg, km.Quit):
		return m, tea.Quit
	}
	return m, nil
}

func bannedView(m Model) string {
	theme := styles.NewTheme(m.Brief.Mood)
	title := theme.Title.Render("Banned seeds (opcional)")
	rule := styles.TitleUnderline(title, theme.Accent)

	// Viewport: show 10 at a time, centered on cursor
	start := m.banned.cursor - 5
	if start < 0 {
		start = 0
	}
	end := start + 10
	if end > len(allSeeds) {
		end = len(allSeeds)
		start = end - 10
		if start < 0 {
			start = 0
		}
	}

	var lines []string
	for i := start; i < end; i++ {
		s := allSeeds[i]
		check := "[ ]"
		if m.banned.selected[s.Name] {
			check = "[×]"
		}
		prefix := theme.Unselected.String()
		line := theme.Value.Render(check+" "+s.Name) + styles.Gap(2) + theme.Hint.Render(s.Desc)
		if i == m.banned.cursor {
			prefix = theme.Selected.String()
			line = theme.Value.Bold(true).Render(check+" "+s.Name) + styles.Gap(2) + theme.Hint.Render(s.Desc)
		}
		lines = append(lines, prefix+line)
	}

	meta := theme.Hint.Render(fmt.Sprintf("%d/%d · %d seleccionados", m.banned.cursor+1, len(allSeeds), len(m.banned.selected)))
	hint := theme.Hint.Render("↑↓ navegar · Espacio toggle · Enter confirmar · Tab saltar · Esc volver")

	body := lipgloss.JoinVertical(lipgloss.Left, append([]string{title, rule, meta, ""}, lines...)...)
	body += "\n\n" + hint
	return styles.Page(body, m.width, m.height)
}
