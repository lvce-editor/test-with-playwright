import type { Page } from '@playwright/test'
import { basename } from 'node:path'
import type { SvgScreenshotOptions } from '../SvgScreenshotOptions/SvgScreenshotOptions.ts'
import * as CaptureSvgScreenshot from '../CaptureSvgScreenshot/CaptureSvgScreenshot.ts'
import * as GetTestState from '../GetTestState/GetTestState.ts'
import * as TestState from '../TestState/TestState.ts'

/**
 * @param {string} absolutePath
 * @param {number} port
 * @param {boolean} traceFocus
 */
export const getUrlFromTestFile = (
  absolutePath: string,
  port: number,
  traceFocus: boolean,
  traceRendererWorker: boolean,
): string => {
  const baseName = basename(absolutePath)
  const htmlFileName = baseName.slice(0, -'.js'.length) + '.html'
  const url = new URL(`http://localhost:${port}/tests/${htmlFileName}`)
  if (traceFocus) {
    url.searchParams.set('traceFocus', 'true')
  }
  if (traceRendererWorker) {
    url.searchParams.set('traceRendererWorker', 'true')
  }
  return url.href
}

export const runTest = async ({
  page,
  port,
  svgScreenshotOptions,
  test,
  testSrc,
  timeout,
  traceFocus,
  traceRendererWorker,
}: {
  readonly test: string
  readonly page: Page
  readonly testSrc: string
  readonly port: number
  readonly timeout: number
  readonly traceFocus?: boolean
  readonly traceRendererWorker?: boolean
  readonly svgScreenshotOptions?: SvgScreenshotOptions
}): Promise<any> => {
  const start = performance.now()
  try {
    const { expect } = await import('@playwright/test')
    const url = getUrlFromTestFile(test, port, traceFocus ?? false, traceRendererWorker ?? false)
    await page.goto(url, {
      waitUntil: 'networkidle',
    })
    const testOverlay = page.locator('#TestOverlay')
    await expect(testOverlay).toBeVisible({
      timeout,
    })
    const text = await testOverlay.textContent()
    const testOverlayState = await testOverlay.getAttribute('data-state')
    // @ts-ignore
    const testState = GetTestState.getTestState(testOverlayState, text || '')
    if (testState.status === TestState.Pass && svgScreenshotOptions) {
      await CaptureSvgScreenshot.captureSvgScreenshot({
        options: svgScreenshotOptions,
        page,
        test,
      })
    }
    const end = performance.now()
    return {
      // @ts-ignore
      ...testState,
      end,
      error: text,
      name: test,
      start,
    }
  } catch (error) {
    const end = performance.now()
    const message = error instanceof Error ? error.message : String(error)
    return {
      end,
      error: message,
      name: test,
      start,
      status: TestState.Fail,
    }
  }
}
