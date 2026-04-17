// Package wizard implements the Eros CLI setup wizard as a Bubble Tea model.
// The wizard drives a 13-step flow (+ splash and template loader) that collects
// a project brief and ultimately launches Claude in the created project.
package wizard

import (
	"github.com/charmbracelet/bubbles/key"
	tea "github.com/charmbracelet/bubbletea"

	"github.com/MateoGs013/eros/cli/internal/brief"
	"github.com/MateoGs013/eros/cli/internal/moods"
	"github.com/MateoGs013/eros/cli/internal/tui/keys"
)

// step is the wizard's current screen.
type step int

const (
	stepSplash step = iota
	stepTemplateLoader
	stepName
	stepSlug
	stepType
	stepMood
	stepScheme
	stepPages
	stepMode
	stepReferences
	stepConstraints
	stepBannedSeeds
	stepAdvanced // overlay — not in forward flow
	stepSummary
	stepExec
	stepLaunch
	stepError
	stepDone
)

// forwardOrder lists the linear flow of the wizard. stepAdvanced is an overlay
// reachable from any step via Ctrl+A, so it is not part of this sequence.
var forwardOrder = []step{
	stepSplash,
	stepTemplateLoader,
	stepName,
	stepSlug,
	stepType,
	stepMood,
	stepScheme,
	stepPages,
	stepMode,
	stepReferences,
	stepConstraints,
	stepBannedSeeds,
	stepSummary,
	stepExec,
	stepLaunch,
}

// Options configures the wizard.
type Options struct {
	// ExistsFn reports whether a project with the given slug already exists.
	// Used to decide whether the slug-editing step (stepSlug) is skipped.
	// Defaults to a no-op returning (false, nil) when nil.
	ExistsFn func(slug string) (bool, error)

	// Profiles are the mood profiles exported by scripts/pipeline/export-moods.mjs.
	// Populated by the caller via moods.Load() before constructing the Model.
	Profiles []moods.Profile
}

// Model is the top-level Bubble Tea model for the wizard. It tracks the
// current step and accumulates a brief.Brief as the user progresses.
type Model struct {
	step    step
	Brief   brief.Brief
	Options Options

	// lastErr captures the last failure to display on stepError.
	lastErr error

	tplLoader   templateLoaderState
	name        nameState
	typeS       typeState
	moodS       moodState
	schemeS     schemeState
	pagesS      pagesState
	modeS       modeState
	refs        referencesState
	constraints constraintsState
	banned      bannedState
	advanced    advancedState
	exec        execState
	launchIntent *LaunchIntent

	// Terminal viewport dimensions, updated via tea.WindowSizeMsg.
	width  int
	height int
}

// New constructs a Model with sensible defaults. The returned model starts
// on stepSplash.
func New(opts Options) Model {
	if opts.ExistsFn == nil {
		opts.ExistsFn = func(string) (bool, error) { return false, nil }
	}
	m := Model{
		step:    stepSplash,
		Brief:   brief.NewDefault(),
		Options: opts,
	}
	templateLoaderInit(&m)
	m.name = nameInit()
	typeInit(&m)
	moodInit(&m)
	schemeInit(&m)
	pagesInit(&m)
	modeInit(&m)
	m.refs = referencesInit()
	m.constraints = constraintsInit()
	bannedInit(&m)
	advancedInit(&m)
	m.exec = execInit()
	return m
}

// LaunchIntent returns the post-wizard handoff instruction, or nil if the user
// did not confirm launch.
func (m Model) LaunchIntent() *LaunchIntent { return m.launchIntent }

// Init implements tea.Model. Dispatches tea.WindowSize() as the first command
// so a WindowSizeMsg arrives before the initial View() paint. Without this,
// BubbleTea invokes View() with m.width/m.height == 0 on the first frame,
// falls back to 100x30 in styles.Page, and renders the card off-center in
// terminals wider than 100 columns. The user sees a leftward shift on the
// splash and every pantalla until the first WindowSizeMsg dispatches.
func (m Model) Init() tea.Cmd { return tea.WindowSize() }

// Advance moves to the next step in the flow. It handles the slug-collision
// shortcut: after stepName, if the derived slug doesn't collide with an
// existing project, stepSlug is skipped and the flow jumps to stepType.
func (m *Model) Advance() {
	if m.step == stepName {
		collides, _ := m.Options.ExistsFn(m.Brief.Slug)
		if !collides {
			m.step = stepType
			return
		}
		m.step = stepSlug
		return
	}
	m.step = nextIn(forwardOrder, m.step)
}

// Back moves to the previous step in the flow. From stepType, Back returns to
// stepName (not stepSlug) because stepSlug is collapsed when there's no
// collision.
func (m *Model) Back() {
	if m.step == stepType {
		m.step = stepName
		return
	}
	m.step = prevIn(forwardOrder, m.step)
}

// GoToError transitions into the error screen, preserving the error for display.
func (m *Model) GoToError(err error) {
	m.lastErr = err
	m.step = stepError
}

// Done reports whether the wizard has finished its flow.
func (m Model) Done() bool { return m.step == stepDone }

// Update routes messages to the per-step handler. New pantalla files add their
// cases here as they are implemented.
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	// Always track viewport size so centering/placing works correctly.
	if sz, ok := msg.(tea.WindowSizeMsg); ok {
		m.width = sz.Width
		m.height = sz.Height
		return m, nil
	}

	// stepExec handles all message types (spinner ticks, done msgs, etc.).
	if m.step == stepExec {
		return execUpdate(m, msg)
	}

	// Global Ctrl+A opens the advanced overlay from any non-exec step.
	if keyMsg, ok := msg.(tea.KeyMsg); ok {
		km := keys.Default()
		if key.Matches(keyMsg, km.Advanced) && m.step != stepAdvanced {
			OpenAdvanced(&m)
			return m, nil
		}
	}

	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch m.step {
		case stepSplash:
			return splashUpdate(m, msg)
		case stepTemplateLoader:
			return templateLoaderUpdate(m, msg)
		case stepName:
			return nameUpdate(m, msg)
		case stepSlug:
			return slugUpdate(m, msg)
		case stepType:
			return typeUpdate(m, msg)
		case stepMood:
			return moodUpdate(m, msg)
		case stepScheme:
			return schemeUpdate(m, msg)
		case stepPages:
			return pagesUpdate(m, msg)
		case stepMode:
			return modeUpdate(m, msg)
		case stepReferences:
			return referencesUpdate(m, msg)
		case stepConstraints:
			return constraintsUpdate(m, msg)
		case stepBannedSeeds:
			return bannedUpdate(m, msg)
		case stepAdvanced:
			return advancedUpdate(m, msg)
		case stepSummary:
			return summaryUpdate(m, msg)
		case stepError:
			return errorUpdate(m, msg)
		case stepLaunch:
			return launchUpdate(m, msg)
		}
	}
	return m, nil
}

// View delegates rendering to the per-step view function.
func (m Model) View() string {
	switch m.step {
	case stepSplash:
		return splashView(m)
	case stepTemplateLoader:
		return templateLoaderView(m)
	case stepName:
		return nameView(m)
	case stepSlug:
		return slugView(m)
	case stepType:
		return typeView(m)
	case stepMood:
		return moodView(m)
	case stepScheme:
		return schemeView(m)
	case stepPages:
		return pagesView(m)
	case stepMode:
		return modeView(m)
	case stepReferences:
		return referencesView(m)
	case stepConstraints:
		return constraintsView(m)
	case stepBannedSeeds:
		return bannedView(m)
	case stepAdvanced:
		return advancedView(m)
	case stepSummary:
		return summaryView(m)
	case stepExec:
		return execView(m)
	case stepError:
		return errorView(m)
	case stepLaunch:
		return launchView(m)
	}
	return ""
}

// nextIn returns the step that follows current in order. If current is the
// last element, it is returned unchanged.
func nextIn(order []step, current step) step {
	for i, s := range order {
		if s == current && i+1 < len(order) {
			return order[i+1]
		}
	}
	return current
}

// prevIn returns the step that precedes current in order. If current is the
// first element, it is returned unchanged.
func prevIn(order []step, current step) step {
	for i, s := range order {
		if s == current && i-1 >= 0 {
			return order[i-1]
		}
	}
	return current
}
