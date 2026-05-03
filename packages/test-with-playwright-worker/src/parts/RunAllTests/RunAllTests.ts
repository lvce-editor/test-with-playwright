import { get } from '@lvce-editor/rpc-registry'
import { join } from 'node:path'
import * as Assert from '../Assert/Assert.ts'
import * as CliCommandType from '../CliCommandType/CliCommandType.ts'
import * as GetTests from '../GetTests/GetTests.ts'
import { Cli } from '../RpcId/RpcId.ts'
import * as RunElectronTests from '../RunElectronTests/RunElectronTests.ts'
import * as RunTests from '../RunTests/RunTests.ts'
import * as SetupTests from '../SetupTests/SetupTests.ts'
import * as StartElectron from '../StartElectron/StartElectron.ts'
import * as TearDownTests from '../TearDownTests/TearDownTests.ts'

interface BrowserRuntimeOptions {
  readonly serverPath?: string
  readonly type: 'browser'
}

interface ElectronRuntimeOptions {
  readonly args: readonly string[]
  readonly cwd: string
  readonly entry: string
  readonly env: Record<string, string>
  readonly executablePath?: string
  readonly type: 'electron'
}

/**
 * @param {string} extensionPath
 * @param {string} testPath
 * @param {string} cwd
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
  headless: boolean,
  timeout: number,
  runtimeOptions: BrowserRuntimeOptions | ElectronRuntimeOptions,
  traceFocus: boolean,
  filter: string | undefined,
): Promise<void> => {
  Assert.string(extensionPath)
  Assert.string(testPath)
  Assert.string(cwd)
  Assert.boolean(headless)
  Assert.number(timeout)
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
  if (runtimeOptions.type === 'electron') {
    const { electronApp, page } = await StartElectron.startElectron({
      runtimeOptions,
      signal,
    })
    await RunElectronTests.runElectronTests({
      ...(filter ? { filter } : {}),
      onFinalResult,
      onResult,
      page,
      tests,
      timeout,
    })
    await TearDownTests.tearDownTests({
      child: electronApp,
      controller,
      kill: async () => {
        await electronApp.close()
      },
    })
    return
  }
  const { child, page, port } = await SetupTests.setupTests({
    headless,
    onlyExtension: extensionPath,
    signal,
    testPath,
    ...(runtimeOptions.serverPath ? { serverPath: runtimeOptions.serverPath } : {}),
  })
  await RunTests.runTests({
    ...(filter ? { filter } : {}),
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
