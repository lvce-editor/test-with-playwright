import * as RunAllTests from '../RunAllTests/RunAllTests.js'

/**
 *
 * @param {{argv:string[], env:any}} param0
 */
export const handleCliArgs = async ({ argv, env }) => {
  const cwd = process.cwd()
  const extensionPath = env.ONLY_EXTENSION
  const testPath = env.TEST_PATH || ''
  const headless = argv.includes('--headless')
  // TODO
  await RunAllTests.runAllTests({
    extensionPath,
    testPath,
    cwd,
    headless,
  })
}
