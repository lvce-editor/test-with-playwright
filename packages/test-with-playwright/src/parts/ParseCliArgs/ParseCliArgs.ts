import parseArgv from 'minimist'

interface ParsedCliArgs {
  browser?: string
  filter?: string
  headless?: boolean
  onlyExtension?: string
  serverPath?: string
  testPath?: string
  traceFocus?: boolean
}

export const parseCliArgs = (argv: string[]): ParsedCliArgs => {
  const parsed = parseArgv(argv)
  const result: ParsedCliArgs = Object.create(null)
  if (parsed.browser) {
    result.browser = parsed.browser
  }
  if (parsed.filter) {
    result.filter = parsed.filter
  }
  if (parsed.headless) {
    result.headless = true
  }
  if (parsed['only-extension']) {
    result.onlyExtension = parsed['only-extension']
  }
  if (parsed['test-path']) {
    result.testPath = parsed['test-path']
  }
  if (parsed['server-path']) {
    result.serverPath = parsed['server-path']
  }
  if (parsed['trace-focus']) {
    result.traceFocus = true
  }
  return result
}
