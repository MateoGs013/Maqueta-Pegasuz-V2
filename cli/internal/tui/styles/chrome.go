package styles

import (
	"regexp"
	"strings"

	"github.com/charmbracelet/bubbles/spinner"
	"github.com/charmbracelet/bubbles/textinput"
	"github.com/charmbracelet/lipgloss"
	"github.com/muesli/termenv"
)

// Force TrueColor globally. lipgloss otherwise auto-detects based on stdout's
// terminal capabilities, which on Windows PowerShell + some terminals
// (especially when stdout is piped) falls back to Ascii/NoColor. That
// fallback strips Background() from every style, causing the terminal's
// default bg (violet in PS) to bleed through every view. All modern terminals
// (Windows Terminal, ConEmu, Wezterm, iTerm2, most Linux VTs) handle 24-bit
// truecolor; the few legacy ones degrade gracefully via the terminal itself.
func init() {
	lipgloss.SetColorProfile(termenv.TrueColor)
}

// rawBGOpen / rawBGClose are raw truecolor SGR sequences for NearBlack (#0a0a0f).
// We emit them directly instead of going through lipgloss.Style.Render so the
// bg always appears — lipgloss drops styling when colorprofile detection falls
// back to Ascii (which happens in tests, CI, and some Windows terminals).
const (
	rawBGOpen  = "\x1b[48;2;10;10;15m"
	rawBGClose = "\x1b[0m"
)

// rawBGPad returns n spaces wrapped in raw truecolor bg SGR. Always emits
// ANSI regardless of terminal detection.
func rawBGPad(n int) string {
	if n <= 0 {
		return ""
	}
	return rawBGOpen + strings.Repeat(" ", n) + rawBGClose
}

// bleedPattern matches an ANSI reset immediately followed by one or more
// plain ASCII spaces. Resets can be spelled as ESC[0m, ESC[m, or ESC[;m
// depending on the upstream renderer (lipgloss vs bubbles vs termenv). The
// pattern captures all three forms so post-processing re-styles the trailing
// padding with NearBlack bg, preventing the terminal's default bg (violet in
// PowerShell) from leaking through.
var bleedPattern = regexp.MustCompile(`(?:\x1b\[0m|\x1b\[m|\x1b\[;m)( +)`)

// fixBleed post-processes a rendered string by re-styling any run of plain
// spaces that follows an ANSI reset. The rewrite keeps a canonical reset in
// place then opens a new bg-only SGR span for the whitespace and closes it,
// guaranteeing the cells carry NearBlack on any terminal — even ones where
// lipgloss's colorprofile detection falls back to no-color.
func fixBleed(s string) string {
	return bleedPattern.ReplaceAllStringFunc(s, func(match string) string {
		spaces := 0
		for i := len(match) - 1; i >= 0 && match[i] == ' '; i-- {
			spaces++
		}
		return rawBGClose + rawBGPad(spaces)
	})
}

// ConfigureTextInput applies the eros theme to a textinput.Model. Every inner
// span (prompt, typed text, placeholder, cursor) gets NearBlack bg so the
// input blends with the full-bleed Page chrome instead of leaking the
// terminal's default (often violet/blue in Windows PowerShell).
func ConfigureTextInput(ti *textinput.Model, accent lipgloss.Color) {
	ti.PromptStyle = lipgloss.NewStyle().Foreground(MutedGray).Background(NearBlack)
	ti.TextStyle = lipgloss.NewStyle().Foreground(WarmWhite).Background(NearBlack)
	ti.PlaceholderStyle = lipgloss.NewStyle().Foreground(MutedGray).Background(NearBlack).Faint(true)
	ti.Cursor.Style = lipgloss.NewStyle().Foreground(accent).Background(NearBlack)
	ti.Cursor.TextStyle = lipgloss.NewStyle().Foreground(WarmWhite).Background(NearBlack)
}

// ConfigureSpinner applies the eros accent + NearBlack bg to a spinner.Model.
func ConfigureSpinner(s *spinner.Model, accent lipgloss.Color) {
	s.Style = lipgloss.NewStyle().Foreground(accent).Background(NearBlack)
}

// TitleUnderline returns a thin accent-colored horizontal rule sized to the
// visible width of the title. Used as a subtle visual anchor under each
// pantalla's title, replacing the heavier border box chrome. Emits raw SGR
// with bg baked in so the underline always paints on NearBlack.
func TitleUnderline(title string, accent lipgloss.Color) string {
	w := lipgloss.Width(title)
	if w < 4 {
		w = 4
	}
	return lipgloss.NewStyle().
		Foreground(accent).
		Background(NearBlack).
		Render(strings.Repeat("─", w))
}

// PadLine pads a single line to `width` cells with raw truecolor bg-styled
// padding on the right. We emit raw ANSI SGR directly (not via lipgloss)
// because lipgloss's colorprofile detection can fall back to no-color on
// terminals where ANSI actually works (tests, Windows Terminal pre-VT, etc.),
// causing the padding to be plain spaces that leak the terminal's default bg.
func PadLine(line string, width int, bg lipgloss.Color) string {
	vw := lipgloss.Width(line)
	if vw >= width {
		return line
	}
	return line + rawBGPad(width-vw)
}

// PadLineCenter pads a single line to `width` cells with bg on both sides so
// the visible text sits in the horizontal center of the rectangle. Shorter
// content still centers around the same axis; no terminal-default bg bleeds.
func PadLineCenter(line string, width int, bg lipgloss.Color) string {
	vw := lipgloss.Width(line)
	if vw >= width {
		return line
	}
	total := width - vw
	left := total / 2
	right := total - left
	return rawBGPad(left) + line + rawBGPad(right)
}

// PadBlock applies PadLine to every line in a multi-line string.
func PadBlock(block string, width int, bg lipgloss.Color) string {
	lines := strings.Split(block, "\n")
	padded := make([]string, len(lines))
	for i, l := range lines {
		padded[i] = PadLine(l, width, bg)
	}
	return strings.Join(padded, "\n")
}

// EmptyRow produces a full-width blank line with NearBlack background.
func EmptyRow(width int, _ lipgloss.Color) string {
	return rawBGPad(width)
}

// Gap returns n spaces rendered with NearBlack background — used as spacer
// between styled spans on the same line. Plain `"  "` string literals leak
// the terminal's default bg (violet in PowerShell); Gap(n) fills the cells.
func Gap(n int) string {
	return rawBGPad(n)
}

// trimTrailingPlainWS strips trailing ASCII spaces and tabs from s while
// preserving ANSI escape sequences. lipgloss.JoinVertical(Left) pads shorter
// lines to the width of the longest line with *plain* spaces (no bg) — those
// plain cells leak the terminal's default background. We strip them here so
// PadLine can refill the gap with bg-colored whitespace.
func trimTrailingPlainWS(s string) string {
	i := len(s)
	for i > 0 {
		c := s[i-1]
		if c == ' ' || c == '\t' {
			i--
			continue
		}
		break
	}
	return s[:i]
}

// MinBlockWidth is the floor for the content block — even if a pantalla has
// only a short title, the block widens to this minimum for breathing room.
// CardHeight is the vertical floor (content gets padded down to this so
// adding a row doesn't shift top-anchored content up).
//
// The block width itself is NOT fixed: it grows to fit the widest content
// line. This gives the best of both visual worlds the user asked for —
// lines left-aligned (sharing a common left edge inside the block) AND
// the block visually centered in the viewport (because the block is sized
// tight to the content, so content mass ≈ block center ≈ viewport center).
//
// Minor tradeoff: typing very long strings (like a reference URL that
// exceeds the other lines) shifts the block slightly. Acceptable because
// the bulk of content (titles, menu items, hints) is static per pantalla.
const (
	MinBlockWidth = 40
	CardHeight    = 22
)

// Page wraps a pantalla body in a full-bleed NearBlack background, centered
// horizontally and vertically in the viewport. `width` and `height` come from
// tea.WindowSizeMsg (m.width, m.height); zero values fall back to 100x30.
//
// The card renders at a fixed CardWidth × CardHeight (plus growth to fit
// naturally-wider content like the splash logo or the mood side-by-side
// view). Content anchors to the top-left of the card so adding rows or
// typing extra characters never shifts the card's position — only the
// content reflows inside it.
//
// Every line is pre-trimmed of trailing plain whitespace so alignment padding
// introduced upstream by lipgloss.JoinVertical does not leak the terminal's
// default background. PadLine then refills the right gap with bg-colored
// whitespace. Widget resets mid-line are patched via fixBleed.
func Page(body string, width, height int) string {
	// BubbleTea calls View() once at startup before any WindowSizeMsg has been
	// dispatched. m.width/m.height are zero on that first paint. Rendering
	// against a fallback width produces a misaligned initial frame (the card
	// centers around 50 cols instead of the true terminal center). Bail out
	// with an empty string so the screen stays blank for the single frame
	// before the real size arrives; the terminal already has bg from the alt
	// screen, so the transition is invisible.
	if width <= 0 || height <= 0 {
		return ""
	}
	w, h := width, height

	body = strings.Trim(body, "\n")
	lines := strings.Split(body, "\n")
	for i, l := range lines {
		lines[i] = trimTrailingPlainWS(l)
	}

	// Block width: tight to the widest content line, with MinBlockWidth floor.
	// Sizing the block to the content means shorter lines flush-left inside
	// the block are near the visual center of the viewport — the block
	// itself is narrow so "flush-left within block" ≈ "near block center".
	blockW := MinBlockWidth
	for _, l := range lines {
		if ww := lipgloss.Width(l); ww > blockW {
			blockW = ww
		}
	}

	// Vertical floor: pad content to CardHeight at the BOTTOM so content
	// stays top-anchored and growing content fills downward instead of
	// shifting the view up.
	cardH := CardHeight
	if len(lines) > cardH {
		cardH = len(lines)
	}
	for len(lines) < cardH {
		lines = append(lines, "")
	}

	// Left-align each line within blockW so all lines share the same left
	// edge (menu items, option rows, input box, hints all align). The block
	// as a whole is then centered in the viewport.
	innerPadded := make([]string, len(lines))
	for i, l := range lines {
		innerPadded[i] = PadLine(fixBleed(l), blockW, NearBlack)
	}

	// Center blockW in the viewport. Viewport gutters always use bg so the
	// space on either side of the block renders as NearBlack.
	leftPad := 0
	if w > blockW {
		leftPad = (w - blockW) / 2
	}
	rightPadCount := w - blockW - leftPad
	if rightPadCount < 0 {
		rightPadCount = 0
	}
	leftGutter := rawBGPad(leftPad)
	rightGutter := rawBGPad(rightPadCount)

	contentLines := make([]string, len(innerPadded))
	for i, l := range innerPadded {
		contentLines[i] = leftGutter + l + rightGutter
	}

	fullRow := rawBGPad(w)
	topPad := 0
	if h > len(contentLines) {
		topPad = (h - len(contentLines)) / 2
	}
	bottomPadCount := h - len(contentLines) - topPad
	if bottomPadCount < 0 {
		bottomPadCount = 0
	}

	rows := make([]string, 0, h)
	for i := 0; i < topPad; i++ {
		rows = append(rows, fullRow)
	}
	rows = append(rows, contentLines...)
	for i := 0; i < bottomPadCount; i++ {
		rows = append(rows, fullRow)
	}

	return strings.Join(rows, "\n")
}
