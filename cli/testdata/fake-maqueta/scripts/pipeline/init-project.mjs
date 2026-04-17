// Stub: logs all args to stderr and exits 0
process.stderr.write('init-project called with: ' + process.argv.slice(2).join(' ') + '\n')
process.stdout.write('bootstrap complete\n')
