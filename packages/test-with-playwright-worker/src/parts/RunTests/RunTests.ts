import type { Page } from '@playwright/test'
import * as RunTest from '../RunTest/RunTest.ts'
import * as TestState from '../TestState/TestState.ts'

const getResultCounts = (status: number): { failed: number; passed: number; skipped: number } => {
  switch (status) {
    case TestState.Fail:
      return { failed: 1, passed: 0, skipped: 0 }
    case TestState.Pass:
      return { failed: 0, passed: 1, skipped: 0 }
    case TestState.Skip:
      return { failed: 0, passed: 0, skipped: 1 }
    default:
      return { failed: 0, passed: 0, skipped: 0 }
  }
}

/**
 *
 * @param {{testSrc:string, tests:string[], filter?: string, headless:boolean, page: import('@playwright/test').Page, port:number, timeout:number, onResult:any, onFinalResult:any}} param0
 */
export const runTests = async ({
  filter,
  headless,
  onFinalResult,
  onResult,
  page,
  port,
  tests,
  testSrc,
  timeout,
  traceFocus,
}: {
  readonly testSrc: string
  readonly tests: readonly string[]
  readonly filter?: string
  readonly headless: boolean
  readonly page: Page
  readonly port: number
  readonly timeout: number
  readonly onResult: (result: any) => Promise<void>
  readonly onFinalResult: (result: any) => Promise<void>
  readonly traceFocus?: boolean
}): Promise<void> => {
  let failed = 0
  let skipped = 0
  let passed = 0
  const start = performance.now()
  // Filter tests if a filter is provided
  const filteredTests = filter ? tests.filter((test) => test.includes(filter)) : tests
  for (const test of filteredTests) {
    const result = await RunTest.runTest({
      page,
      port,
      test,
      testSrc,
      timeout,
      traceFocus: traceFocus ?? false,
    })
    await onResult(result)
    // @ts-ignore
    const resultCounts = getResultCounts(result.status)
    failed += resultCounts.failed
    passed += resultCounts.passed
    skipped += resultCounts.skipped
  }
  const end = performance.now()
  await onFinalResult({
    end,
    failed,
    passed,
    skipped,
    start,
  })
}
