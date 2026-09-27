import type { Page } from '@playwright/test'
import type { SvgScreenshotOptions } from '../SvgScreenshotOptions/SvgScreenshotOptions.ts'
import * as BrowserTraceTimeline from '../BrowserTraceTimeline/BrowserTraceTimeline.ts'
import * as RendererWorkerTrace from '../RendererWorkerTrace/RendererWorkerTrace.ts'
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
  rendererWorkerTraceDirectory,
  svgScreenshotOptions,
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
  readonly rendererWorkerTraceDirectory?: string
  readonly timeout: number
  readonly onResult: (result: any) => Promise<void>
  readonly onFinalResult: (result: any) => Promise<void>
  readonly traceFocus?: boolean
  readonly svgScreenshotOptions?: SvgScreenshotOptions
}): Promise<void> => {
  let failed = 0
  let skipped = 0
  let passed = 0
  const start = performance.now()
  // Filter tests if a filter is provided
  const filteredTests = filter ? tests.filter((test) => test.includes(filter)) : tests
  for (const test of filteredTests) {
    // WebKit can hang when navigation tears down the previous test's workers.
    // Close an isolated context instead of navigating a live worker document.
    const browser = page.context().browser()
    const context = browser?.browserType().name() === 'webkit' ? await browser.newContext() : undefined
    let result
    try {
      const testPage = context ? await context.newPage() : page
      if (context && rendererWorkerTraceDirectory) {
        await testPage.addInitScript(BrowserTraceTimeline.install)
      }
      result = await RunTest.runTest({
        page: testPage,
        port,
        test,
        testSrc,
        timeout,
        traceFocus: traceFocus ?? false,
        traceRendererWorker: rendererWorkerTraceDirectory !== undefined,
        ...(svgScreenshotOptions && { svgScreenshotOptions }),
      })
      if (rendererWorkerTraceDirectory) {
        await RendererWorkerTrace.exportTrace({
          directory: rendererWorkerTraceDirectory,
          page: testPage,
          test,
        })
      }
    } finally {
      await context?.close()
    }
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
