import type { Page } from '@playwright/test'
import * as RunTest from '../RunTest/RunTest.ts'

export const runElectronTest = async ({
  page,
  test,
  timeout,
}: {
  readonly page: Page
  readonly test: string
  readonly timeout: number
}): Promise<any> => {
  return RunTest.runTest({
    page,
    port: 3001,
    test,
    timeout,
  })
}
