import parseArgv from 'minimist'

interface ParsedCliArgs {
  browser?: string
  coverage?: boolean
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
  svgScreenshotDir?: string
  svgScreenshotSelector?: string
  testPath?: string
  timeout?: number
  traceFocus?: boolean
  updateSvgScreenshots?: boolean
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

const toPositiveNumber = (value: unknown, name: string): number => {
  const number = Number(toCliString(value))
  if (!Number.isFinite(number) || number <= 0) {
    throw new TypeError(`expected ${name} to be a positive number`)
  }
  return number
}

const setOptionalPositiveNumber = (
  result: ParsedCliArgs,
  key: keyof ParsedCliArgs,
  value: unknown,
  name: string,
): void => {
  if (value !== undefined) {
    result[key] = toPositiveNumber(value, name) as never
  }
}

const setOptionalString = (result: ParsedCliArgs, key: keyof ParsedCliArgs, value: unknown): void => {
  if (value) {
    result[key] = toCliString(value) as never
  }
}

const setFlag = (result: ParsedCliArgs, key: keyof ParsedCliArgs, value: unknown): void => {
  if (value) {
    result[key] = true as never
  }
}

const getRuntime = (parsed: Record<string, unknown>): string | undefined => {
  if (parsed.electron) {
    return 'electron'
  }
  if (parsed.runtime) {
    return toCliString(parsed.runtime)
  }
  return undefined
}

export const parseCliArgs = (argv: string[]): ParsedCliArgs => {
  const parsed = parseArgv(argv)
  const result: ParsedCliArgs = Object.create(null)
  if (parsed.browser) {
    result.browser = String(parsed.browser)
  }
  setFlag(result, 'coverage', parsed.coverage)
  const runtime = getRuntime(parsed)
  if (runtime) {
    result.runtime = runtime
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
  setOptionalPositiveNumber(result, 'timeout', parsed.timeout, '--timeout')
  if (parsed['server-path']) {
    result.serverPath = String(parsed['server-path'])
  }
  setOptionalString(result, 'svgScreenshotDir', parsed['svg-screenshot-dir'])
  setOptionalString(result, 'svgScreenshotSelector', parsed['svg-screenshot-selector'])
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
  setFlag(result, 'updateSvgScreenshots', parsed['update-svg-screenshots'])
  return result
}
