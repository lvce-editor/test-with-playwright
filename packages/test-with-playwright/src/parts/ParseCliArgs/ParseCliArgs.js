import parseArgv from 'minimist'

export const parseCliArgs = (argv) => {
  const parsed = parseArgv(argv)
  const result = Object.create(null)
  if (parsed.headless) {
    result.headless = true
  }
  if (parsed['only-extension']) {
    result.onlyExtension = parsed['only-extension']
  }
  if (parsed['test-path']) {
    result.testPath = parsed['test-path']
  }
  return result
}
