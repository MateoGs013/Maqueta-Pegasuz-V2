package wizard

import (
	"strings"
	"testing"
)

func TestSplashView_ContainsMenuItems(t *testing.T) {
	m := New(Options{})
	m.width = 100
	m.height = 30
	view := m.View()
	// EROS is rendered as ASCII block letters, so we check for menu items
	// and the subtitle as stable textual anchors.
	for _, item := range []string{"[N]", "nuevo proyecto", "[Q]", "salir"} {
		if !strings.Contains(view, item) {
			t.Errorf("splash view missing %q\n---\n%s", item, view)
		}
	}
}
