package main

import (
	"fmt"
	"os"

	"github.com/MateoGs013/eros/cli/cmd"
)

// version is baked into the binary. Override at build time with
//
//	go build -ldflags "-X main.version=0.1.0-dev+commit.abc123" ./
//
// to stamp commit and build date. Defaults to the release baseline.
var version = "0.1.0"

func main() {
	if err := cmd.Execute(version); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
