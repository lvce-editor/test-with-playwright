import type { Page } from '@playwright/test'
import { join } from 'node:path'
import * as CoverageWorker from '../CoverageWorker/CoverageWorker.ts'

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
    await CoverageWorker.writeJavascriptCoverage(entries, join(cwd, 'coverage'))
  }
}
