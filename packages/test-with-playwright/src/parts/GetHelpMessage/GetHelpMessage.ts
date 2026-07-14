export const getHelpMessage = (): string => {
  return `Usage: test-with-playwright [options]

Options:
  --browser=<browser>       Browser to run tests in: chromium, firefox, or webkit
  --runtime=<runtime>       Runtime to run tests in: browser or electron
  --electron                Run tests in Electron and infer the matching Lvce version
  --filter=<pattern>        Only run tests matching the filter
  --headless                Run the browser in headless mode
  --reuse-page              Run browser tests through /tests/_all.html on one page
  --only-extension=<path>   Path to the extension under test
  --server-path=<path>      Path to the editor server entrypoint
  --test-path=<path>        Path to the test files
  --timeout=<ms>            Test timeout in milliseconds
  --trace-focus             Log focus changes while tests run
  --electron-path=<path>    Path to an existing Electron app executable
  --electron-version=<ver>  Override the inferred Lvce release version
  --electron-cache-dir=<p>  Directory for downloaded Electron apps
  --electron-arg=<arg>      Extra Electron app argument, repeatable
  --electron-env=<env>      Electron environment variable as NAME=value, repeatable
  -h, --help                Show this help message

Environment:
  ONLY_EXTENSION            Default extension path
  TEST_PATH                 Default test path`
}
