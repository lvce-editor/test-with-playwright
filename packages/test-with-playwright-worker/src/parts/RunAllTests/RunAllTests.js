import { join } from 'path'
import * as Assert from '../Assert/Assert.js'
import { getTests } from '../GetTests/GetTests.js'
import * as RunTests from '../RunTests/RunTests.js'
import * as SetupTests from '../SetupTests/SetupTests.js'
import * as TearDownTests from '../TearDownTests/TearDownTests.js'
import * as JsonRpc from '../JsonRpc/JsonRpc.js'
import * as CliCommandType from '../CliCommandType/CliCommandType.js'

/**
 * @param {any} ipc
 * @param {string} extensionPath
 * @param {string} testPath
 * @param {string} cwd
 * @param {boolean} headless
 * @param {number} headless
 */
export const runAllTests = async (ipc, extensionPath, testPath, cwd, headless, timeout) => {
  Assert.string(extensionPath)
  Assert.string(testPath)
  Assert.string(cwd)
  Assert.boolean(headless)
  Assert.number(timeout)
  const controller = new AbortController()
  const signal = controller.signal
  const { browser, page, child, port } = await SetupTests.setupTests({
    signal,
    headless,
  })
  const testSrc = join(testPath, 'src')
  const tests = await getTests(testSrc)
  const onResult = (result) => {
    JsonRpc.send(ipc, CliCommandType.HandleResult, result)
  }
  const onFinalResult = (finalResult) => {
    JsonRpc.send(ipc, CliCommandType.HandleFinalResult, finalResult)
  }
  await RunTests.runTests({ testSrc, tests, headless, port, page, timeout, onResult, onFinalResult })
  await TearDownTests.tearDownTests({
    controller,
    child,
  })
}
