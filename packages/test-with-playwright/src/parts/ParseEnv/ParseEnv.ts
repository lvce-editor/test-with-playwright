interface ParsedEnv {
  onlyExtension?: string
  testPath?: string
}

export const parseEnv = (env: Readonly<NodeJS.ProcessEnv>): ParsedEnv => {
  const options: ParsedEnv = Object.create(null)
  if (env['ONLY_EXTENSION']) {
    options['onlyExtension'] = env['ONLY_EXTENSION']
  }
  if (env['TEST_PATH']) {
    options['testPath'] = env['TEST_PATH']
  }
  return options
}
