import { NodeWorkerRpcParent } from '@lvce-editor/rpc'
import { fileURLToPath } from 'node:url'
import * as TestWorkerCommandType from '../TestWorkerCommandType/TestWorkerCommandType.ts'

interface RunAllTestsParams {
  commandMap: any
  cwd: string
  headless: boolean
  onlyExtension: string
  serverPath?: string
  testPath: string
  testWorkerUri: string
  timeout: number
}

export const runAllTests = async ({
  commandMap,
  cwd,
  headless,
  onlyExtension,
  serverPath,
  testPath,
  testWorkerUri,
  timeout,
}: Readonly<RunAllTestsParams>): Promise<void> => {
  // TODO use `using` once supported
  const path = fileURLToPath(testWorkerUri)
  const rpc = await NodeWorkerRpcParent.create({
    argv: [],
    commandMap,
    path,
    stdio: 'inherit',
  })
  await rpc.invoke(TestWorkerCommandType.RunAllTests, onlyExtension, testPath, cwd, headless, timeout, serverPath)
  await rpc.dispose()
}
