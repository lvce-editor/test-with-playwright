import * as GetOptions from '../GetOptions/GetOptions.js'
import * as RunAllTests from '../RunAllTests/RunAllTests.js'

/**
 *
 * @param {{argv:string[], env:any}} param0
 */
export const handleCliArgs = async ({ argv, env }) => {
  const cwd = process.cwd()
  const options = GetOptions.getOptions({ argv, env })
  const extensionPath = options.extensionPath
  const testPath = options.testPath
  const headless = options.headless
  const timeout = 30_000
  // TODO
  // console.log({ argv, env })
  await RunAllTests.runAllTests({
    extensionPath,
    testPath,
    cwd,
    headless,
    timeout,
  })
}
