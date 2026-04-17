package runner

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"os/exec"

	"github.com/MateoGs013/eros/cli/internal/paths"
)

// NodeOptions configures a node script execution.
type NodeOptions struct {
	ScriptRel []string         // path relative to scripts/
	Args      []string
	OnLine    func(string)     // called per line of stdout
	Env       map[string]string // extra env vars
}

// RunNodeScript executes a Node script from the maqueta and streams stdout line-by-line.
func RunNodeScript(ctx context.Context, opts NodeOptions) error {
	scriptPath, err := paths.ScriptPath(opts.ScriptRel...)
	if err != nil {
		return err
	}

	args := append([]string{scriptPath}, opts.Args...)
	cmd := exec.CommandContext(ctx, "node", args...)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return err
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return err
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("start node: %w", err)
	}

	var stderrBuf []byte
	go func() {
		stderrBuf, _ = io.ReadAll(stderr)
	}()

	scanner := bufio.NewScanner(stdout)
	for scanner.Scan() {
		if opts.OnLine != nil {
			opts.OnLine(scanner.Text())
		}
	}

	if err := cmd.Wait(); err != nil {
		return fmt.Errorf("node script failed: %w\nstderr:\n%s", err, string(stderrBuf))
	}
	return nil
}
