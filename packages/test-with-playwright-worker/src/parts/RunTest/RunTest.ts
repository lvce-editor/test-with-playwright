import type { Page } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import type { SvgScreenshotOptions } from '../SvgScreenshotOptions/SvgScreenshotOptions.ts'
import * as CaptureSvgScreenshot from '../CaptureSvgScreenshot/CaptureSvgScreenshot.ts'
import * as GetTestState from '../GetTestState/GetTestState.ts'
import * as TestState from '../TestState/TestState.ts'

const saveDiagnosticMessages = async (page: Page, test: string): Promise<void> => {
  const directory = process.env['E2E_DIAGNOSTIC_DIR']
  if (!directory) {
    return
  }
  let messages: unknown
  try {
    messages = await page.evaluate(() => {
      // @ts-expect-error Test-only renderer-process diagnostic global.
      return globalThis.___receivedMessages || []
    })
  } catch (error) {
    messages = [{ captureError: String(error) }]
  }
  await mkdir(directory, { recursive: true })
  const name = basename(test, extname(test))
  const attempt = process.env['E2E_DIAGNOSTIC_ATTEMPT'] || 'unknown'
  const path = join(directory, `allmessages-${name}-attempt-${attempt}.json`)
  await writeFile(path, `${JSON.stringify(messages, null, 2)}\n`)
  console.info(`[e2e diagnostics] wrote ${path}`)
}

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

export const navigateToTest = async (page: Page, url: string): Promise<void> => {
  await page.goto(url, {
    waitUntil: 'domcontentloaded',
  })
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
    await navigateToTest(page, url)
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
  } finally {
    await saveDiagnosticMessages(page, test)
  }
}
