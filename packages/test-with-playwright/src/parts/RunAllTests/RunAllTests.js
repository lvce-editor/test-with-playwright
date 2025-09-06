import { NodeWorkerRpcParent } from '@lvce-editor/rpc'
import * as GetTestWorkerPath from '../GetTestWorkerPath/GetTestWorkerPath.js'
import * as TestWorkerCommandType from '../TestWorkerCommandType/TestWorkerCommandType.js'

/**
 *
 * @param {{onlyExtension:string, testPath:string, cwd:string, headless:boolean, timeout:number, commandMap:any}} param0
 */
export const runAllTests = async ({ onlyExtension, testPath, cwd, headless, timeout, commandMap }) => {
  const path = GetTestWorkerPath.getTestWorkerPath()
  // TODO use `using` once supported
  const rpc = await NodeWorkerRpcParent.create({
    path,
    argv: [],
    commandMap,
  })
  await rpc.invoke(TestWorkerCommandType.RunAllTests, onlyExtension, testPath, cwd, headless, timeout)
  rpc.dispose()
}
