import * as SetupTests from '../SetupTests/SetupTests.js'
import { join } from 'path'
import * as Signal from '../Signal/Signal.js'

/**
 *
 * @param {{testSrc:string, tests:string[], headless:boolean}} param0
 */
export const runTests = async ({ testSrc, tests, headless }) => {
  const controller = new AbortController()
  const signal = controller.signal
  const { browser, page, child, port } = await SetupTests.setupTests({
    signal,
    headless,
  })
  for (const test of tests) {
    const url = `http://localhost:${port}`
    // const url = `http://example.com`
    await page.goto(url, {
      waitUntil: 'networkidle',
    })
    const absolutePath = join(testSrc, test)
  }
  console.log('setup finished')
  controller.abort()
  child.kill(Signal.SIGINT)
}
