package slug

import (
	"regexp"
	"strings"
	"unicode"

	"golang.org/x/text/runes"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
)

var nonAlphaNum = regexp.MustCompile(`[^a-z0-9]+`)

// Slugify converts a string to a URL-safe slug:
// lowercase, ASCII-only, hyphen-separated, no leading/trailing hyphens.
func Slugify(s string) string {
	t := transform.Chain(norm.NFD, runes.Remove(runes.In(unicode.Mn)), norm.NFC)
	stripped, _, _ := transform.String(t, s)
	lower := strings.ToLower(stripped)
	replaced := nonAlphaNum.ReplaceAllString(lower, "-")
	return strings.Trim(replaced, "-")
}
