import * as GetOptions from '../GetOptions/GetOptions.js'
import * as RunAllTests from '../RunAllTests/RunAllTests.js'
import * as GetTestWorkerPath from '../GetTestWorkerPath/GetTestWorkerPath.js'

/**
 *
 * @param {{argv:string[], env:any, commandMap:any}} param0
 */
export const handleCliArgs = async ({ argv, env, commandMap }) => {
  const cwd = process.cwd()
  const options = GetOptions.getOptions({ argv, env })
  const onlyExtension = options.onlyExtension
  const testPath = options.testPath
  const headless = options.headless
  const timeout = 30_000
  const testWorkerPath = GetTestWorkerPath.getTestWorkerPath()

  // TODO
  // console.log({ argv, env })
  await RunAllTests.runAllTests({
    onlyExtension,
    testPath,
    cwd,
    headless,
    timeout,
    commandMap,
    testWorkerPath,
  })
}
