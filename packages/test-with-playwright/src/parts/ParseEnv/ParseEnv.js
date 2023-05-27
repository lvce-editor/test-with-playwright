export const parseEnv = (env) => {
  const options = Object.create(null)
  if (env['ONLY_EXTENSION']) {
    options['extensionPath'] = env['ONLY_EXTENSION']
  }
  if (env['TEST_PATH']) {
    options['testPath'] = env['TEST_PATH']
  }
  return options
}
