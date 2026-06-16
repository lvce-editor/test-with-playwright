import { get } from '@lvce-editor/rpc-registry'
import { join } from 'node:path'
import * as Assert from '../Assert/Assert.ts'
import * as CliCommandType from '../CliCommandType/CliCommandType.ts'
import * as GetServerPath from '../GetServerPath/GetServerPath.ts'
import * as GetTests from '../GetTests/GetTests.ts'
import { Cli } from '../RpcId/RpcId.ts'
import * as RunElectronTests from '../RunElectronTests/RunElectronTests.ts'
import * as RunTests from '../RunTests/RunTests.ts'
import * as SetupTests from '../SetupTests/SetupTests.ts'
import * as StartElectron from '../StartElectron/StartElectron.ts'
import * as StartServer from '../StartServer/StartServer.ts'
import * as TearDownTests from '../TearDownTests/TearDownTests.ts'

export interface BrowserRuntimeOptions {
  readonly serverPath?: string
  readonly type: 'browser'
}

export interface ElectronRuntimeOptions {
  readonly args: readonly string[]
  readonly env: Record<string, string>
  readonly executablePath: string
  readonly serverPath?: string
  readonly type: 'electron'
}

/**
 * @param {string} extensionPath
 * @param {string} testPath
 * @param {string} cwd
 * @param {'chromium'|'firefox'} browser
 * @param {boolean} headless
 * @param {number} timeout
 * @param {string} serverPath
 * @param {boolean} traceFocus
 * @param {string} filter
 */
export const runAllTests = async (
  extensionPath: string,
  testPath: string,
  cwd: string,
  browser: 'chromium' | 'firefox',
  headless: boolean,
  timeout: number,
  runtimeOptions: BrowserRuntimeOptions | ElectronRuntimeOptions,
  traceFocus: boolean,
  filter: string | undefined,
): Promise<void> => {
  Assert.string(extensionPath)
  Assert.string(testPath)
  Assert.string(cwd)
  Assert.string(browser)
  Assert.boolean(headless)
  Assert.number(timeout)
  Assert.object(runtimeOptions)
  const rpc = get(Cli)
  const controller = new AbortController()
  const { signal } = controller
  const testSrc = join(testPath, 'src')
  const tests = await GetTests.getTests(testSrc)
  const onResult = async (result: any): Promise<void> => {
    await rpc.invoke(CliCommandType.HandleResult, result)
  }
  const onFinalResult = async (finalResult: any): Promise<void> => {
    await rpc.invoke(CliCommandType.HandleFinalResult, finalResult)
  }
  const filterOption = filter === undefined ? undefined : { filter }
  if (runtimeOptions.type === 'electron') {
    const port = 3001
    const resolvedServerPath = await GetServerPath.getServerPath(runtimeOptions.serverPath)
    const child = await StartServer.startServer({
      onlyExtension: extensionPath,
      port,
      serverPath: resolvedServerPath,
      signal,
      testPath,
    })
    try {
      await using electron = await StartElectron.startElectron({
        runtimeOptions,
        signal,
      })
      await RunElectronTests.runElectronTests({
        ...filterOption,
        electronApp: electron.electronApp,
        onFinalResult,
        onResult,
        page: electron.page,
        port,
        tests,
        testSrc,
        timeout,
      })
    } finally {
      await TearDownTests.tearDownTests({
        child,
        controller,
      })
    }
    return
  }
  const { child, page, port } = await SetupTests.setupTests({
    browser,
    headless,
    onlyExtension: extensionPath,
    ...(runtimeOptions.serverPath && { serverPath: runtimeOptions.serverPath }),
    signal,
    testPath,
  })
  await RunTests.runTests({
    ...filterOption,
    headless,
    onFinalResult,
    onResult,
    page,
    port,
    tests,
    testSrc,
    timeout,
    traceFocus,
  })
  await TearDownTests.tearDownTests({
    child,
    controller,
  })
}
