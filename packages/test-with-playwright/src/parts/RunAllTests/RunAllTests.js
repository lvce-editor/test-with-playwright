import * as GetTestWorkerPath from '../GetTestWorkerPath/GetTestWorkerPath.js'
import * as IpcParent from '../IpcParent/IpcParent.js'
import * as IpcParentType from '../IpcParentType/IpcParentType.js'
import * as JsonRpc from '../JsonRpc/JsonRpc.js'
import * as TestWorkerCommandType from '../TestWorkerCommandType/TestWorkerCommandType.js'

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
  await JsonRpc.invoke(ipc, TestWorkerCommandType.RunAllTests, extensionPath, testPath, cwd, headless)
  ipc.dispose()
}
