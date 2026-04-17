package slug

import "testing"

func TestSlugify(t *testing.T) {
	cases := []struct {
		input, want string
	}{
		{"Northstar Atelier", "northstar-atelier"},
		{"  double  spaces ", "double-spaces"},
		{"Café con Leche", "cafe-con-leche"},
		{"MIXED_Case-123", "mixed-case-123"},
		{"!!!@@@###", ""},
		{"", ""},
		{"--leading-trailing--", "leading-trailing"},
		{"emoji 🎨 design", "emoji-design"},
	}
	for _, c := range cases {
		got := Slugify(c.input)
		if got != c.want {
			t.Errorf("Slugify(%q) = %q, want %q", c.input, got, c.want)
		}
	}
}
