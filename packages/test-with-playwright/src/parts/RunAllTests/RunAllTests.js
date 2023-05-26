import { join } from 'path'
import { getTests } from '../GetTests/GetTests.js'
import * as Process from '../Process/Process.js'
import * as ProcessListeners from '../ProcessListeners/ProcessListeners.js'
import { runTests } from '../RunTests/RunTests.js'
import * as IpcParent from '../IpcParent/IpcParent.js'
import * as IpcParentType from '../IpcParentType/IpcParentType.js'
import * as GetTestWorkerPath from '../GetTestWorkerPath/GetTestWorkerPath.js'

/**
 *
 * @param {{extensionPath:string, testPath:string, cwd:string, headless:boolean}} param0
 */
export const runAllTests = async ({ extensionPath, testPath, cwd, headless }) => {
  const path = GetTestWorkerPath.getTestWorkerPath()
  const ipc = await IpcParent.create({
    method: IpcParentType.NodeWorker,
    path,
    argv: [],
  })
  await new Promise((r) => {
    setTimeout(r, 100)
  })
  ipc.dispose()
  // Process.on('uncaughtExceptionMonitor', ProcessListeners.handleUncaughtExceptionMonitor)
  // const testSrc = join(testPath, 'src')
  // const tests = await getTests(testSrc)
  // await runTests({ testSrc, tests, headless })
  // console.log({ extensionPath, testPath, tests })
}
