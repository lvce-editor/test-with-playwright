import { NodeWorkerRpcParent } from '@lvce-editor/rpc'
import * as TestWorkerCommandType from '../TestWorkerCommandType/TestWorkerCommandType.ts'

interface RunAllTestsParams {
  onlyExtension: string
  testPath: string
  cwd: string
  headless: boolean
  timeout: number
  commandMap: any
  testWorkerPath: string
}

export const runAllTests = async ({ onlyExtension, testPath, cwd, headless, timeout, commandMap, testWorkerPath }: RunAllTestsParams): Promise<void> => {
  // TODO use `using` once supported
  const rpc = await NodeWorkerRpcParent.create({
    path: testWorkerPath,
    argv: [],
    commandMap,
  })
  await rpc.invoke(TestWorkerCommandType.RunAllTests, onlyExtension, testPath, cwd, headless, timeout)
  await rpc.dispose()
}
