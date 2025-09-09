import type { Page } from '@playwright/test'
import * as RunTest from '../RunTest/RunTest.ts'
import * as TestState from '../TestState/TestState.ts'

/**
 *
 * @param {{testSrc:string, tests:string[], headless:boolean, page: import('@playwright/test').Page, port:number, timeout:number, onResult:any, onFinalResult:any}} param0
 */
export const runTests = async ({
  testSrc,
  tests,
  headless,
  page,
  port,
  timeout,
  onResult,
  onFinalResult,
}: {
  readonly testSrc: string
  readonly tests: readonly string[]
  readonly headless: boolean
  readonly page: Page
  readonly port: number
  readonly timeout: number
  readonly onResult: (result: any) => Promise<void>
  readonly onFinalResult: (result: any) => Promise<void>
}): Promise<void> => {
  let failed = 0
  let skipped = 0
  let passed = 0
  const start = performance.now()
  for (const test of tests) {
    const result = await RunTest.runTest({
      test,
      page,
      testSrc,
      port,
      timeout,
    })
    await onResult(result)
    // @ts-ignore
    switch (result.status) {
      case TestState.Fail:
        failed++
        break
      case TestState.Skip:
        skipped++
        break
      case TestState.Pass:
        passed++
        break
      default:
        break
    }
  }
  const end = performance.now()
  await onFinalResult({
    passed,
    failed,
    skipped,
    start,
    end,
  })
}
