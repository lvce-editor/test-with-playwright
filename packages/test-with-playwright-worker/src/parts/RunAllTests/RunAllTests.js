import { join } from 'path'
import { getTests } from '../GetTests/GetTests.js'
import { runTests } from '../RunTests/RunTests.js'
import * as Assert from '../Assert/Assert.js'

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
  const testSrc = join(testPath, 'src')
  const tests = await getTests(testSrc)
  await runTests({ testSrc, tests, headless })
  console.log({ extensionPath, testPath, tests })
}
