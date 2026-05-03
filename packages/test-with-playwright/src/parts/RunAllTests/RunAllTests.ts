import { NodeWorkerRpcParent } from '@lvce-editor/rpc'
import { fileURLToPath } from 'node:url'
import * as TestWorkerCommandType from '../TestWorkerCommandType/TestWorkerCommandType.ts'

interface RunAllTestsParams {
  browser: 'chromium' | 'firefox'
  commandMap: any
  cwd: string
  filter?: string
  headless: boolean
  onlyExtension: string
  serverPath?: string
  testPath: string
  testWorkerUri: string
  timeout: number
  traceFocus?: boolean
}

export const runAllTests = async ({
  browser,
  commandMap,
  cwd,
  filter,
  headless,
  onlyExtension,
  serverPath,
  testPath,
  testWorkerUri,
  timeout,
  traceFocus,
}: Readonly<RunAllTestsParams>): Promise<void> => {
  // TODO use `using` once supported
  const path = fileURLToPath(testWorkerUri)
  const rpc = await NodeWorkerRpcParent.create({
    argv: [],
    commandMap,
    path,
    stdio: 'inherit',
  })
  await rpc.invoke(
    TestWorkerCommandType.RunAllTests,
    onlyExtension,
    testPath,
    cwd,
    browser,
    headless,
    timeout,
    serverPath,
    traceFocus,
    filter,
  )
  await rpc.dispose()
}
