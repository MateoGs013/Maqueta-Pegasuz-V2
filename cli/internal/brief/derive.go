package brief

import "fmt"

// DeriveDescription produces a canonical description from type + mood.
func DeriveDescription(typ, mood string) string {
	return fmt.Sprintf("A %s site with %s direction.", typ, mood)
}

var audienceByType = map[string]string{
	"creative-studio":     "Founders y marcas premium que esperan craft editorial.",
	"product-saas":        "Equipos de producto que valoran claridad e interacción de calidad.",
	"brutalist-editorial": "Audiencias exigentes que buscan presencia visual fuerte y no-genérica.",
	"luxury-brand":        "Clientes de marca premium que esperan restraint y materiales de alta calidad.",
	"dashboard-app":       "Usuarios técnicos que necesitan datos densos sin sacrificar diseño.",
	"portfolio":           "Visitantes que llegan a evaluar craft y criterio.",
	"agency":              "Clientes potenciales que contratan por el nivel del sitio mismo.",
	"ecommerce-boutique":  "Compradores que responden a presentación editorial del producto.",
}

const audienceFallback = "Visitantes que valoran diseño intencional y craft."

// DeriveAudience returns a default audience string for a given type.
func DeriveAudience(typ string) string {
	if s, ok := audienceByType[typ]; ok {
		return s
	}
	return audienceFallback
}

// ApplyDerivations fills description/audience/promptSummary/seedFamilies when empty.
// seedFamilies should come from the mood profile loaded separately.
func ApplyDerivations(b *Brief, seedFamilies []string) {
	if b.Description == "" {
		b.Description = DeriveDescription(b.Type, b.Mood)
	}
	if b.Audience == "" {
		b.Audience = DeriveAudience(b.Type)
	}
	if b.PromptSummary == "" {
		b.PromptSummary = b.Description
	}
	if len(b.SeedFamilies) == 0 && len(seedFamilies) > 0 {
		b.SeedFamilies = seedFamilies
	}
}
