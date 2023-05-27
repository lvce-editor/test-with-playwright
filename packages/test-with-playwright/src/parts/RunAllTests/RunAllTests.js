import * as GetTestWorkerPath from '../GetTestWorkerPath/GetTestWorkerPath.js'
import * as HandleIpc from '../HandleIpc/HandleIpc.js'
import * as IpcParent from '../IpcParent/IpcParent.js'
import * as IpcParentType from '../IpcParentType/IpcParentType.js'
import * as JsonRpc from '../JsonRpc/JsonRpc.js'
import * as TestWorkerCommandType from '../TestWorkerCommandType/TestWorkerCommandType.js'

/**
 *
 * @param {{onlyExtension:string, testPath:string, cwd:string, headless:boolean, timeout:number}} param0
 */
export const runAllTests = async ({ onlyExtension, testPath, cwd, headless, timeout }) => {
  const path = GetTestWorkerPath.getTestWorkerPath()
  const ipc = await IpcParent.create({
    method: IpcParentType.NodeWorker,
    path,
    argv: [],
  })
  HandleIpc.handleIpc(ipc)
  await JsonRpc.invoke(ipc, TestWorkerCommandType.RunAllTests, onlyExtension, testPath, cwd, headless, timeout)
  ipc.dispose()
}
