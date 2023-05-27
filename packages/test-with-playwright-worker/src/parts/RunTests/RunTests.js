import { join } from 'path'
import * as RunTest from '../RunTest/RunTest.js'

/**
 *
 * @param {{testSrc:string, tests:string[], headless:boolean, page: import('@playwright/test').Page, port:number, timeout:number, onResult:any}} param0
 */
export const runTests = async ({ testSrc, tests, headless, page, port, timeout, onResult }) => {
  for (const test of tests) {
    const result = await RunTest.runTest({
      test,
      page,
      testSrc,
      port,
      timeout,
    })
    onResult(result)
  }
}
