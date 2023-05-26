import { join } from 'path'
import { getTests } from '../GetTests/GetTests.js'
import * as Process from '../Process/Process.js'
import * as ProcessListeners from '../ProcessListeners/ProcessListeners.js'
import { runTests } from '../RunTests/RunTests.js'

/**
 *
 * @param {{extensionPath:string, testPath:string, cwd:string, headless:boolean}} param0
 */
export const runAllTests = async ({ extensionPath, testPath, cwd, headless }) => {
  Process.on('uncaughtExceptionMonitor', ProcessListeners.handleUncaughtExceptionMonitor)
  const testSrc = join(testPath, 'src')
  const tests = await getTests(testSrc)
  await runTests({ testSrc, tests, headless })
  console.log({ extensionPath, testPath, tests })
}
