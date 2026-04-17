package projects

import (
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

// Project holds parsed state from a .eros/state.md file.
type Project struct {
	Slug          string
	Name          string
	Path          string
	Phase         string
	Task          string
	Mode          string
	SectionsDone  int
	SectionsTotal int
}

var (
	reName     = regexp.MustCompile(`(?m)^-\s*\*\*Project:\*\*\s*(.+?)\s*\(([^)]+)\)`)
	rePhase    = regexp.MustCompile(`(?m)^-\s*\*\*Phase:\*\*\s*(\S+)`)
	reTask     = regexp.MustCompile(`(?m)^-\s*\*\*Task:\*\*\s*(.+)`)
	reMode     = regexp.MustCompile(`(?m)^-\s*\*\*Mode:\*\*\s*(\S+)`)
	reSections = regexp.MustCompile(`(?m)^-\s*\*\*Sections:\*\*\s*(\d+)/(\d+)`)
)

// Scan finds all Eros projects under ~/Desktop/ by locating .eros/state.md files.
func Scan() ([]Project, error) {
	home, err := userHome()
	if err != nil {
		return nil, err
	}
	desktop := filepath.Join(home, "Desktop")

	entries, err := os.ReadDir(desktop)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}

	var out []Project
	for _, e := range entries {
		if !e.IsDir() {
			continue
		}
		p, ok := readProject(filepath.Join(desktop, e.Name()))
		if !ok {
			continue
		}
		out = append(out, p)
	}

	sort.Slice(out, func(i, j int) bool { return out[i].Slug < out[j].Slug })
	return out, nil
}

func readProject(dir string) (Project, bool) {
	state, err := os.ReadFile(filepath.Join(dir, ".eros", "state.md"))
	if err != nil {
		return Project{}, false
	}

	s := string(state)
	p := Project{
		Slug: filepath.Base(dir),
		Path: dir,
	}
	if m := reName.FindStringSubmatch(s); len(m) == 3 {
		p.Name = strings.TrimSpace(m[1])
		p.Slug = strings.TrimSpace(m[2])
	}
	if m := rePhase.FindStringSubmatch(s); len(m) == 2 {
		p.Phase = m[1]
	}
	if m := reTask.FindStringSubmatch(s); len(m) == 2 {
		p.Task = strings.TrimSpace(m[1])
	}
	if m := reMode.FindStringSubmatch(s); len(m) == 2 {
		p.Mode = m[1]
	}
	if m := reSections.FindStringSubmatch(s); len(m) == 3 {
		p.SectionsDone, _ = strconv.Atoi(m[1])
		p.SectionsTotal, _ = strconv.Atoi(m[2])
	}
	return p, true
}

// Exists returns true if a project directory already exists for this slug.
func Exists(slug string) (bool, error) {
	home, err := userHome()
	if err != nil {
		return false, err
	}
	_, err = os.Stat(filepath.Join(home, "Desktop", slug))
	if err == nil {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return false, err
}

func userHome() (string, error) {
	if h := os.Getenv("USERPROFILE"); h != "" {
		return h, nil
	}
	if h := os.Getenv("HOME"); h != "" {
		return h, nil
	}
	return os.UserHomeDir()
}
