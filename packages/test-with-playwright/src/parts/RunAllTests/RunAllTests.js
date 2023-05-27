import * as GetTestWorkerPath from '../GetTestWorkerPath/GetTestWorkerPath.js'
import * as IpcParent from '../IpcParent/IpcParent.js'
import * as IpcParentType from '../IpcParentType/IpcParentType.js'
import * as JsonRpc from '../JsonRpc/JsonRpc.js'
import * as TestWorkerCommandType from '../TestWorkerCommandType/TestWorkerCommandType.js'
import * as HandleIpc from '../HandleIpc/HandleIpc.js'

/**
 *
 * @param {{extensionPath:string, testPath:string, cwd:string, headless:boolean, timeout:number}} param0
 */
export const runAllTests = async ({ extensionPath, testPath, cwd, headless, timeout }) => {
  const path = GetTestWorkerPath.getTestWorkerPath()
  const ipc = await IpcParent.create({
    method: IpcParentType.NodeWorker,
    path,
    argv: [],
  })
  HandleIpc.handleIpc(ipc)
  console.time('run tests')
  await JsonRpc.invoke(ipc, TestWorkerCommandType.RunAllTests, extensionPath, testPath, cwd, headless, timeout)
  console.timeEnd('run tests')
  ipc.dispose()
}
