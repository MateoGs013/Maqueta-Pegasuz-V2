package brief

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestBriefJSONRoundTrip(t *testing.T) {
	original := Brief{
		Name:          "Test Studio",
		Slug:          "test-studio",
		Type:          "creative-studio",
		Description:   "A creative-studio site with Dark cinematic editorial direction.",
		Audience:      "founders",
		Pages:         []string{"home", "work"},
		Mood:          "Dark cinematic editorial",
		Scheme:        "dark",
		References:    []string{"https://example.com"},
		Constraints:   []string{"no blue"},
		Mode:          "autonomous",
		Brand:         "scratch",
		Backend:       "none",
		PromptSummary: "A creative-studio site with Dark cinematic editorial direction.",
		SeedFamilies:  []string{"cinematic", "ambient", "editorial"},
		BannedSeeds:   []string{"S-BentoDashboard"},
	}

	data, err := json.MarshalIndent(original, "", "  ")
	if err != nil {
		t.Fatal(err)
	}

	s := string(data)
	for _, field := range []string{"\"seedFamilies\"", "\"promptSummary\"", "\"bannedSeeds\""} {
		if !strings.Contains(s, field) {
			t.Errorf("serialized brief missing %s: %s", field, s)
		}
	}

	var decoded Brief
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatal(err)
	}

	if decoded.Name != original.Name || decoded.Mood != original.Mood {
		t.Errorf("round-trip mismatch: got %+v", decoded)
	}
}
