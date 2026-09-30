import type { Page } from '@playwright/test'
import { join } from 'node:path'
import * as CoverageWorker from '../CoverageWorker/CoverageWorker.ts'
import * as WorkerJavascriptCoverage from '../WorkerJavascriptCoverage/WorkerJavascriptCoverage.ts'

export const runWithJavascriptCoverage = async ({
  coverage,
  coverageInclude,
  coverageTarget,
  coverageThreshold,
  cwd,
  page,
  run,
}: {
  readonly coverage: boolean
  readonly coverageInclude?: string | undefined
  readonly coverageTarget?: string | undefined
  readonly coverageThreshold?: number | undefined
  readonly cwd: string
  readonly page: Page
  readonly run: () => Promise<void>
}): Promise<void> => {
  if (!coverage && !coverageTarget) {
    await run()
    return
  }
  const workerCoverage = coverageTarget
    ? await WorkerJavascriptCoverage.startWorkerJavascriptCoverage(page, coverageTarget)
    : undefined
  let pageCoverageStarted = false
  try {
    if (coverage) {
      await page.coverage.startJSCoverage({ resetOnNavigation: false })
      pageCoverageStarted = true
    }
    await run()
  } finally {
    let workerEntries: Awaited<ReturnType<NonNullable<typeof workerCoverage>['stop']>> | undefined
    if (pageCoverageStarted) {
      try {
        const entries = await page.coverage.stopJSCoverage()
        await CoverageWorker.writeJavascriptCoverage(entries, join(cwd, 'coverage'))
      } finally {
        workerEntries = await workerCoverage?.stop()
      }
    } else if (workerCoverage) {
      workerEntries = await workerCoverage.stop()
    }
    if (workerEntries) {
      await CoverageWorker.writeJavascriptCoverage(
        workerEntries,
        join(cwd, 'coverage', 'worker'),
        coverageThreshold,
        coverageInclude,
      )
    }
  }
}
