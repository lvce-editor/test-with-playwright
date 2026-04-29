import parseArgv from 'minimist'

interface ParsedCliArgs {
  electronArgs?: string[]
  electronCwd?: string
  electronEntry?: string
  electronEnv?: string[]
  electronPath?: string
  filter?: string
  headless?: boolean
  onlyExtension?: string
  runtime?: string
  serverPath?: string
  testPath?: string
  traceFocus?: boolean
}

const toStringArray = (value: unknown): string[] | undefined => {
  if (typeof value === 'undefined') {
    return undefined
  }
  if (Array.isArray(value)) {
    return value.map(String)
  }
  return [String(value)]
}

export const parseCliArgs = (argv: string[]): ParsedCliArgs => {
  const parsed = parseArgv(argv)
  const result: ParsedCliArgs = Object.create(null)
  if (parsed.runtime) {
    result.runtime = String(parsed.runtime)
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
  if (parsed['electron-path']) {
    result.electronPath = String(parsed['electron-path'])
  }
  if (parsed['electron-cwd']) {
    result.electronCwd = String(parsed['electron-cwd'])
  }
  if (parsed['electron-entry']) {
    result.electronEntry = String(parsed['electron-entry'])
  }
  const electronArgs = toStringArray(parsed['electron-arg'])
  if (electronArgs) {
    result.electronArgs = electronArgs
  }
  const electronEnv = toStringArray(parsed['electron-env'])
  if (electronEnv) {
    result.electronEnv = electronEnv
  }
  if (parsed['trace-focus']) {
    result.traceFocus = true
  }
  return result
}
