import { get } from '@lvce-editor/rpc-registry'
import { join } from 'node:path'
import type { SvgScreenshotOptions } from '../SvgScreenshotOptions/SvgScreenshotOptions.ts'
import * as Assert from '../Assert/Assert.ts'
import * as CliCommandType from '../CliCommandType/CliCommandType.ts'
import * as GetTests from '../GetTests/GetTests.ts'
import { Cli } from '../RpcId/RpcId.ts'
import * as RunElectronTests from '../RunElectronTests/RunElectronTests.ts'
import * as RunTests from '../RunTests/RunTests.ts'
import * as RunTestsWithReusedPage from '../RunTestsWithReusedPage/RunTestsWithReusedPage.ts'
import * as SetupTests from '../SetupTests/SetupTests.ts'
import * as StartElectron from '../StartElectron/StartElectron.ts'
import * as TearDownTests from '../TearDownTests/TearDownTests.ts'

export interface BrowserRuntimeOptions {
  readonly serverPath?: string
  readonly type: 'browser'
}

export interface ElectronRuntimeOptions {
  readonly args: readonly string[]
  readonly env: Record<string, string>
  readonly executablePath: string
  readonly type: 'electron'
}

/**
 * @param {string} extensionPath
 * @param {string} testPath
 * @param {string} cwd
 * @param {'chromium'|'firefox'|'webkit'} browser
 * @param {boolean} headless
 * @param {number} timeout
 * @param {string} serverPath
 * @param {boolean} traceFocus
 * @param {string} filter
 * @param {boolean} reusePage
 */
export const runAllTests = async (
  extensionPath: string,
  testPath: string,
  cwd: string,
  browser: 'chromium' | 'firefox' | 'webkit',
  headless: boolean,
  timeout: number,
  runtimeOptions: BrowserRuntimeOptions | ElectronRuntimeOptions,
  traceFocus: boolean,
  filter: string | undefined,
  reusePage: boolean,
  svgScreenshotOptions: SvgScreenshotOptions | undefined,
): Promise<void> => {
  Assert.string(extensionPath)
  Assert.string(testPath)
  Assert.string(cwd)
  Assert.string(browser)
  Assert.boolean(headless)
  Assert.number(timeout)
  Assert.object(runtimeOptions)
  Assert.boolean(reusePage)
  if (svgScreenshotOptions !== undefined) {
    Assert.object(svgScreenshotOptions)
  }
  const rpc = get(Cli)
  const controller = new AbortController()
  const { signal } = controller
  const testSrc = join(testPath, 'src')
  const onResult = async (result: any): Promise<void> => {
    await rpc.invoke(CliCommandType.HandleResult, result)
  }
  const onFinalResult = async (finalResult: any): Promise<void> => {
    await rpc.invoke(CliCommandType.HandleFinalResult, finalResult)
  }
  const filterOption = filter === undefined ? undefined : { filter }
  if (runtimeOptions.type === 'electron') {
    const tests = await GetTests.getTests(testSrc)
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
      tests,
      testSrc,
      timeout,
      ...(svgScreenshotOptions && { svgScreenshotOptions }),
    })
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
  if (reusePage) {
    await RunTestsWithReusedPage.runTestsWithReusedPage({
      ...filterOption,
      onFinalResult,
      onResult,
      page,
      port,
      timeout,
      traceFocus,
    })
    await TearDownTests.tearDownTests({
      child,
      controller,
    })
    return
  }
  const tests = await GetTests.getTests(testSrc)
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
    ...(svgScreenshotOptions && { svgScreenshotOptions }),
  })
  await TearDownTests.tearDownTests({
    child,
    controller,
  })
}
