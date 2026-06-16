import type { Page } from '@playwright/test'
import * as RunElectronTest from '../RunElectronTest/RunElectronTest.ts'
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

export const runElectronTests = async ({
  filter,
  onFinalResult,
  onResult,
  page,
  port,
  tests,
  testSrc,
  timeout,
}: {
  readonly electronApp: any
  readonly filter?: string
  readonly onFinalResult: (result: any) => Promise<void>
  readonly onResult: (result: any) => Promise<void>
  readonly page: Page
  readonly port: number
  readonly tests: readonly string[]
  readonly testSrc: string
  readonly timeout: number
}): Promise<void> => {
  let failed = 0
  let skipped = 0
  let passed = 0
  const start = performance.now()
  const filteredTests = filter ? tests.filter((test) => test.includes(filter)) : tests
  for (const test of filteredTests) {
    const result = await RunElectronTest.runElectronTest({
      page,
      port,
      test,
      timeout,
    })
    await onResult(result)
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
