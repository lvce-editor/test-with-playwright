import { get } from '@lvce-editor/rpc-registry'
import { join } from 'node:path'
import * as Assert from '../Assert/Assert.ts'
import * as CliCommandType from '../CliCommandType/CliCommandType.ts'
import * as GetTests from '../GetTests/GetTests.ts'
import { Cli } from '../RpcId/RpcId.ts'
import * as RunTests from '../RunTests/RunTests.ts'
import * as SetupTests from '../SetupTests/SetupTests.ts'
import * as TearDownTests from '../TearDownTests/TearDownTests.ts'

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
  extensionPath,
  testPath,
  cwd,
  headless,
  timeout,
  serverPath,
  traceFocus,
  filter,
): Promise<void> => {
  Assert.string(extensionPath)
  Assert.string(testPath)
  Assert.string(cwd)
  Assert.boolean(headless)
  Assert.number(timeout)
  const rpc = get(Cli)
  const controller = new AbortController()
  const { signal } = controller
  // @ts-ignore
  const { child, page, port } = await SetupTests.setupTests({
    headless,
    onlyExtension: extensionPath,
    serverPath,
    signal,
    testPath,
  })
  const testSrc = join(testPath, 'src')
  const tests = await GetTests.getTests(testSrc)
  const onResult = async (result): Promise<void> => {
    await rpc.invoke(CliCommandType.HandleResult, result)
  }
  const onFinalResult = async (finalResult): Promise<void> => {
    await rpc.invoke(CliCommandType.HandleFinalResult, finalResult)
  }
  await RunTests.runTests({ headless, onFinalResult, onResult, page, port, tests, testSrc, timeout, traceFocus })
  await TearDownTests.tearDownTests({
    child,
    controller,
  })
}
