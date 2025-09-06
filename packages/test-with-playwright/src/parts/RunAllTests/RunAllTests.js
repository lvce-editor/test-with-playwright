import { NodeWorkerRpcParent } from '@lvce-editor/rpc'
import * as TestWorkerCommandType from '../TestWorkerCommandType/TestWorkerCommandType.js'

/**
 *
 * @param {{onlyExtension:string, testPath:string, cwd:string, headless:boolean, timeout:number, commandMap:any, testWorkerPath:string}} param0
 */
export const runAllTests = async ({ onlyExtension, testPath, cwd, headless, timeout, commandMap, testWorkerPath }) => {
  // TODO use `using` once supported
  const rpc = await NodeWorkerRpcParent.create({
    path: testWorkerPath,
    argv: [],
    commandMap,
  })
  await rpc.invoke(TestWorkerCommandType.RunAllTests, onlyExtension, testPath, cwd, headless, timeout)
  await rpc.dispose()
}
