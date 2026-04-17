package wizard

import "testing"

func TestModel_InitialStep(t *testing.T) {
	m := New(Options{})
	if m.step != stepSplash {
		t.Errorf("initial step = %v, want stepSplash", m.step)
	}
}

func TestModel_Advance(t *testing.T) {
	m := New(Options{})
	m.step = stepName
	m.Brief.Slug = "something-new"
	m.Advance()
	// With default ExistsFn returning false, stepSlug is skipped
	if m.step != stepType {
		t.Errorf("after Advance from name (no collision), step = %v, want stepType", m.step)
	}
}

func TestModel_Back(t *testing.T) {
	m := New(Options{})
	m.step = stepMood
	m.Back()
	if m.step != stepType {
		t.Errorf("after Back from mood, step = %v, want stepType", m.step)
	}
}

func TestModel_SkipSlugOnNoCollision(t *testing.T) {
	m := New(Options{ExistsFn: func(string) (bool, error) { return false, nil }})
	m.step = stepName
	m.Brief.Name = "Clean Name"
	m.Brief.Slug = "clean-name"
	m.Advance()
	if m.step != stepType {
		t.Errorf("expected skip to type, got %v", m.step)
	}
}

func TestModel_StopOnSlugCollision(t *testing.T) {
	m := New(Options{ExistsFn: func(string) (bool, error) { return true, nil }})
	m.step = stepName
	m.Brief.Slug = "existing"
	m.Advance()
	if m.step != stepSlug {
		t.Errorf("expected stop on slug, got %v", m.step)
	}
}

func TestModel_GoToError(t *testing.T) {
	m := New(Options{})
	m.step = stepExec
	err := errTest("boom")
	m.GoToError(err)
	if m.step != stepError {
		t.Errorf("GoToError did not transition to stepError, got %v", m.step)
	}
	if m.lastErr == nil || m.lastErr.Error() != "boom" {
		t.Errorf("lastErr not preserved, got %v", m.lastErr)
	}
}

func TestModel_BackFromTypeReturnsToName(t *testing.T) {
	m := New(Options{})
	m.step = stepType
	m.Back()
	if m.step != stepName {
		t.Errorf("back from type = %v, want stepName (slug collapsed)", m.step)
	}
}

type errTest string

func (e errTest) Error() string { return string(e) }
