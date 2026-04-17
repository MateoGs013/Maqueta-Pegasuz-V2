package brief

// Brief matches the intake.json schema consumed by scripts/pipeline/init-project.mjs.
// Field names must match Node's normalizeBrief exactly — do not rename.
type Brief struct {
	Name          string   `json:"name"`
	Slug          string   `json:"slug"`
	Type          string   `json:"type"`
	Description   string   `json:"description"`
	Audience      string   `json:"audience"`
	Pages         []string `json:"pages"`
	Mood          string   `json:"mood"`
	Scheme        string   `json:"scheme"`
	References    []string `json:"references"`
	Constraints   []string `json:"constraints"`
	Mode          string   `json:"mode"`
	Brand         string   `json:"brand"`
	Backend       string   `json:"backend"`
	PromptSummary string   `json:"promptSummary"`
	SeedFamilies  []string `json:"seedFamilies"`
	BannedSeeds   []string `json:"bannedSeeds"`
}

// NewDefault returns a Brief with safe defaults. Name/Slug/Mood/Pages must be filled by caller.
func NewDefault() Brief {
	return Brief{
		Type:    "creative-studio",
		Scheme:  "dark",
		Mode:    "autonomous",
		Brand:   "scratch",
		Backend: "none",
	}
}
