import { join } from 'path'
import * as RunTest from '../RunTest/RunTest.js'

/**
 *
 * @param {{testSrc:string, tests:string[], headless:boolean, page: import('@playwright/test').Page, port:number}} param0
 */
export const runTests = async ({ testSrc, tests, headless, page, port }) => {
  for (const test of tests) {
    await RunTest.runTest({
      test,
      page,
      testSrc,
      port,
    })
  }
}
