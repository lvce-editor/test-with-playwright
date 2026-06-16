export const getHelpMessage = (): string => {
  return `Usage: test-with-playwright [options]

Options:
  --browser=<browser>       Browser to run tests in: chromium or firefox
  --filter=<pattern>        Only run tests matching the filter
  --headless                Run the browser in headless mode
  --only-extension=<path>   Path to the extension under test
  --server-path=<path>      Path to the editor server entrypoint
  --test-path=<path>        Path to the test files
  --trace-focus             Log focus changes while tests run
  -h, --help                Show this help message

Environment:
  ONLY_EXTENSION            Default extension path
  TEST_PATH                 Default test path`
}
