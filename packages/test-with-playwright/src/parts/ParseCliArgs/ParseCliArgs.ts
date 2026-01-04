import parseArgv from 'minimist'

interface ParsedCliArgs {
  headless?: boolean
  onlyExtension?: string
  serverPath?: string
  testPath?: string
}

export const parseCliArgs = (argv: string[]): ParsedCliArgs => {
  const parsed = parseArgv(argv)
  const result: ParsedCliArgs = Object.create(null)
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
  return result
}
