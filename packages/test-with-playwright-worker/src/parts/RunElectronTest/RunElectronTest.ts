import type { Page } from '@playwright/test'
import * as RunTest from '../RunTest/RunTest.ts'

export const runElectronTest = async ({
  page,
  port,
  test,
  timeout,
}: {
  readonly page: Page
  readonly port: number
  readonly test: string
  readonly timeout: number
}): Promise<any> => {
  return RunTest.runTest({
    page,
    port,
    test,
    timeout,
  })
}
