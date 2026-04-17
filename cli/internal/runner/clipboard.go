package runner

import "golang.design/x/clipboard"

var clipboardReady = false

// CopyText copies a string to the system clipboard.
// Initializes the clipboard package lazily on first use.
func CopyText(s string) error {
	if !clipboardReady {
		if err := clipboard.Init(); err != nil {
			return err
		}
		clipboardReady = true
	}
	clipboard.Write(clipboard.FmtText, []byte(s))
	return nil
}
