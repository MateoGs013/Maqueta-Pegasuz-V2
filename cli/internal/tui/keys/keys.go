package keys

import "github.com/charmbracelet/bubbles/key"

type Map struct {
	Up       key.Binding
	Down     key.Binding
	Left     key.Binding
	Right    key.Binding
	Enter    key.Binding
	Tab      key.Binding
	Back     key.Binding
	Quit     key.Binding
	Help     key.Binding
	Save     key.Binding // Ctrl+S
	Advanced key.Binding // Ctrl+A
	Copy     key.Binding // Ctrl+Y
	Edit     key.Binding // Ctrl+E
}

func Default() Map {
	return Map{
		Up:       key.NewBinding(key.WithKeys("up", "k"), key.WithHelp("↑/k", "subir")),
		Down:     key.NewBinding(key.WithKeys("down", "j"), key.WithHelp("↓/j", "bajar")),
		Left:     key.NewBinding(key.WithKeys("left", "h"), key.WithHelp("←", "atrás")),
		Right:    key.NewBinding(key.WithKeys("right", "l"), key.WithHelp("→", "avanzar")),
		Enter:    key.NewBinding(key.WithKeys("enter"), key.WithHelp("⏎", "confirmar")),
		Tab:      key.NewBinding(key.WithKeys("tab"), key.WithHelp("tab", "saltar")),
		Back:     key.NewBinding(key.WithKeys("esc"), key.WithHelp("esc", "volver")),
		Quit:     key.NewBinding(key.WithKeys("ctrl+c", "q"), key.WithHelp("ctrl+c/q", "salir")),
		Help:     key.NewBinding(key.WithKeys("?"), key.WithHelp("?", "ayuda")),
		Save:     key.NewBinding(key.WithKeys("ctrl+s"), key.WithHelp("ctrl+s", "guardar template")),
		Advanced: key.NewBinding(key.WithKeys("ctrl+a"), key.WithHelp("ctrl+a", "avanzado")),
		Copy:     key.NewBinding(key.WithKeys("ctrl+y"), key.WithHelp("ctrl+y", "copiar")),
		Edit:     key.NewBinding(key.WithKeys("ctrl+e"), key.WithHelp("ctrl+e", "editar slug")),
	}
}
