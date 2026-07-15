import { NodeWorkerRpcParent } from '@lvce-editor/rpc'
import { fileURLToPath } from 'node:url'
import * as TestWorkerCommandType from '../TestWorkerCommandType/TestWorkerCommandType.ts'

interface RunAllTestsParams {
  browser: 'chromium' | 'firefox' | 'webkit'
  commandMap: any
  cwd: string
  filter?: string
  headless: boolean
  onlyExtension: string
  reusePage: boolean
  runtimeOptions: any
  svgScreenshotOptions?: {
    readonly directory: string
    readonly name: string
    readonly selector?: string
    readonly update: boolean
  }
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
  reusePage,
  runtimeOptions,
  svgScreenshotOptions,
  testPath,
  testWorkerUri,
  timeout,
  traceFocus,
}: Readonly<RunAllTestsParams>): Promise<void> => {
  // TODO use `using` once supported
  const path = fileURLToPath(testWorkerUri)
  const rpc = await NodeWorkerRpcParent.create({
    argv: [`--browser=${browser}`],
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
    runtimeOptions,
    traceFocus,
    filter,
    reusePage,
    svgScreenshotOptions,
  )
  await rpc.dispose()
}
