package brief

import "testing"

func TestDeriveDescription(t *testing.T) {
	got := DeriveDescription("creative-studio", "Dark cinematic editorial")
	want := "A creative-studio site with Dark cinematic editorial direction."
	if got != want {
		t.Errorf("DeriveDescription = %q, want %q", got, want)
	}
}

func TestDeriveAudience(t *testing.T) {
	cases := map[string]string{
		"creative-studio":     "Founders y marcas premium que esperan craft editorial.",
		"product-saas":        "Equipos de producto que valoran claridad e interacción de calidad.",
		"brutalist-editorial": "Audiencias exigentes que buscan presencia visual fuerte y no-genérica.",
		"luxury-brand":        "Clientes de marca premium que esperan restraint y materiales de alta calidad.",
		"dashboard-app":       "Usuarios técnicos que necesitan datos densos sin sacrificar diseño.",
		"portfolio":           "Visitantes que llegan a evaluar craft y criterio.",
		"agency":              "Clientes potenciales que contratan por el nivel del sitio mismo.",
		"ecommerce-boutique":  "Compradores que responden a presentación editorial del producto.",
		"unknown-type":        "Visitantes que valoran diseño intencional y craft.",
	}
	for typ, want := range cases {
		if got := DeriveAudience(typ); got != want {
			t.Errorf("DeriveAudience(%q) = %q, want %q", typ, got, want)
		}
	}
}

func TestApplyDerivations(t *testing.T) {
	b := &Brief{
		Type: "creative-studio",
		Mood: "Dark cinematic editorial",
	}
	ApplyDerivations(b, []string{"cinematic", "ambient"})

	if b.Description == "" {
		t.Error("Description should be derived")
	}
	if b.Audience == "" {
		t.Error("Audience should be derived")
	}
	if b.PromptSummary == "" {
		t.Error("PromptSummary should be derived")
	}
	if len(b.SeedFamilies) != 2 {
		t.Errorf("SeedFamilies should have 2 entries, got %d", len(b.SeedFamilies))
	}
}

func TestApplyDerivations_DoesNotOverwrite(t *testing.T) {
	b := &Brief{
		Type:          "creative-studio",
		Mood:          "Dark cinematic editorial",
		Description:   "Custom description",
		Audience:      "Custom audience",
		PromptSummary: "Custom summary",
		SeedFamilies:  []string{"existing"},
	}
	ApplyDerivations(b, []string{"new-family"})

	if b.Description != "Custom description" {
		t.Errorf("Description should not be overwritten, got %q", b.Description)
	}
	if b.Audience != "Custom audience" {
		t.Errorf("Audience should not be overwritten, got %q", b.Audience)
	}
	if b.PromptSummary != "Custom summary" {
		t.Errorf("PromptSummary should not be overwritten, got %q", b.PromptSummary)
	}
	if len(b.SeedFamilies) != 1 || b.SeedFamilies[0] != "existing" {
		t.Errorf("SeedFamilies should not be overwritten, got %v", b.SeedFamilies)
	}
}
