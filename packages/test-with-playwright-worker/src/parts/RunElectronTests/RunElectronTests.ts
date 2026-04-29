import type { Page } from '@playwright/test'
import * as RunElectronTest from '../RunElectronTest/RunElectronTest.ts'
import * as TestState from '../TestState/TestState.ts'

export const runElectronTests = async ({
  filter,
  onFinalResult,
  onResult,
  page,
  tests,
  timeout,
}: {
  readonly filter?: string
  readonly onFinalResult: (result: any) => Promise<void>
  readonly onResult: (result: any) => Promise<void>
  readonly page: Page
  readonly tests: readonly string[]
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
      test,
      timeout,
    })
    await onResult(result)
    switch (result.status) {
      case TestState.Fail:
        failed++
        break
      case TestState.Pass:
        passed++
        break
      case TestState.Skip:
        skipped++
        break
      default:
        break
    }
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
