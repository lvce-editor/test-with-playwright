import { join } from 'path'
import * as Assert from '../Assert/Assert.js'
import { getTests } from '../GetTests/GetTests.js'
import * as RunTests from '../RunTests/RunTests.js'
import * as SetupTests from '../SetupTests/SetupTests.js'
import * as TearDownTests from '../TearDownTests/TearDownTests.js'

/**
 *
 * @param {string} extensionPath
 * @param {string} testPath
 * @param {string} cwd
 * @param {boolean} headless
 */
export const runAllTests = async (extensionPath, testPath, cwd, headless) => {
  Assert.string(extensionPath)
  Assert.string(testPath)
  Assert.string(cwd)
  Assert.boolean(headless)
  const controller = new AbortController()
  const signal = controller.signal
  const { browser, page, child, port } = await SetupTests.setupTests({
    signal,
    headless,
  })
  const testSrc = join(testPath, 'src')
  const tests = await getTests(testSrc)
  await RunTests.runTests({ testSrc, tests, headless, port, page })
  await TearDownTests.tearDownTests({
    controller,
    child,
  })
}
