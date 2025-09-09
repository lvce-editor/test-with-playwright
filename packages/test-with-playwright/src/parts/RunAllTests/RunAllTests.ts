import { NodeWorkerRpcParent } from '@lvce-editor/rpc'
import { fileURLToPath } from 'node:url'
import * as TestWorkerCommandType from '../TestWorkerCommandType/TestWorkerCommandType.ts'

interface RunAllTestsParams {
  onlyExtension: string
  testPath: string
  cwd: string
  headless: boolean
  timeout: number
  commandMap: any
  testWorkerUri: string
}

export const runAllTests = async ({
  onlyExtension,
  testPath,
  cwd,
  headless,
  timeout,
  commandMap,
  testWorkerUri,
}: RunAllTestsParams): Promise<void> => {
  // TODO use `using` once supported
  const path = fileURLToPath(testWorkerUri)
  const rpc = await NodeWorkerRpcParent.create({
    path,
    argv: [],
    commandMap,
    stdio: 'inherit',
  })
  await rpc.invoke(TestWorkerCommandType.RunAllTests, onlyExtension, testPath, cwd, headless, timeout)
  await rpc.dispose()
}
