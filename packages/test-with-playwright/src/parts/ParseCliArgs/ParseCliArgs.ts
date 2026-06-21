import parseArgv from 'minimist'

interface ParsedCliArgs {
  browser?: string
  electronArgs?: string[]
  electronCacheDir?: string
  electronEnv?: string[]
  electronPath?: string
  electronVersion?: string
  filter?: string
  headless?: boolean
  help?: boolean
  onlyExtension?: string
  reusePage?: boolean
  runtime?: string
  serverPath?: string
  testPath?: string
  traceFocus?: boolean
}

const toCliString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  throw new TypeError('expected cli argument value to be a string, number, or boolean')
}

const toStringArray = (value: unknown): string[] | undefined => {
  if (value === undefined) {
    return undefined
  }
  if (Array.isArray(value)) {
    return value.map(toCliString)
  }
  return [toCliString(value)]
}

export const parseCliArgs = (argv: string[]): ParsedCliArgs => {
  const parsed = parseArgv(argv)
  const result: ParsedCliArgs = Object.create(null)
  if (parsed.browser) {
    result.browser = String(parsed.browser)
  }
  if (parsed.runtime) {
    result.runtime = String(parsed.runtime)
  }
  if (parsed.filter) {
    result.filter = String(parsed.filter)
  }
  if (parsed.help || parsed.h) {
    result.help = true
  }
  if (parsed.headless) {
    result.headless = true
  }
  if (parsed['only-extension']) {
    result.onlyExtension = String(parsed['only-extension'])
  }
  if (parsed['reuse-page']) {
    result.reusePage = true
  }
  if (parsed['test-path']) {
    result.testPath = String(parsed['test-path'])
  }
  if (parsed['server-path']) {
    result.serverPath = String(parsed['server-path'])
  }
  if (parsed['electron-path']) {
    result.electronPath = String(parsed['electron-path'])
  }
  if (parsed['electron-version']) {
    result.electronVersion = String(parsed['electron-version'])
  }
  if (parsed['electron-cache-dir']) {
    result.electronCacheDir = String(parsed['electron-cache-dir'])
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
