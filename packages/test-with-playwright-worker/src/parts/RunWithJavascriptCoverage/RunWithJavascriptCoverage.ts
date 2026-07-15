import type { Page } from '@playwright/test'
import { join } from 'node:path'
import * as CreateJavascriptCoverage from '../CreateJavascriptCoverage/CreateJavascriptCoverage.ts'
import * as WriteJavascriptCoverage from '../WriteJavascriptCoverage/WriteJavascriptCoverage.ts'

export const runWithJavascriptCoverage = async ({
  coverage,
  cwd,
  page,
  run,
}: {
  readonly coverage: boolean
  readonly cwd: string
  readonly page: Page
  readonly run: () => Promise<void>
}): Promise<void> => {
  if (!coverage) {
    await run()
    return
  }
  await page.coverage.startJSCoverage({ resetOnNavigation: false })
  try {
    await run()
  } finally {
    const entries = await page.coverage.stopJSCoverage()
    const coverageMap = await CreateJavascriptCoverage.createJavascriptCoverage(entries)
    await WriteJavascriptCoverage.writeJavascriptCoverage(coverageMap, join(cwd, 'coverage'))
  }
}
