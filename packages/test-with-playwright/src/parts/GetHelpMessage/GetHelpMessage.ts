export const getHelpMessage = (): string => {
  return `Usage: test-with-playwright [options]

Options:
  --browser=<browser>       Browser to run tests in: chromium, firefox, or webkit
  --runtime=<runtime>       Runtime to run tests in: browser or electron
  --filter=<pattern>        Only run tests matching the filter
  --headless                Run the browser in headless mode
  --only-extension=<path>   Path to the extension under test
  --server-path=<path>      Path to the editor server entrypoint
  --test-path=<path>        Path to the test files
  --trace-focus             Log focus changes while tests run
  --electron-path=<path>    Path to an existing Electron app executable
  --electron-version=<ver>  Lvce release version to download, for example v0.84.0
  --electron-cache-dir=<p>  Directory for downloaded Electron apps
  --electron-arg=<arg>      Extra Electron app argument, repeatable
  --electron-env=<env>      Electron environment variable as NAME=value, repeatable
  -h, --help                Show this help message

Environment:
  ONLY_EXTENSION            Default extension path
  TEST_PATH                 Default test path`
}
