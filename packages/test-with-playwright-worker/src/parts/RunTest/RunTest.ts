import type { Page } from '@playwright/test'
import { basename } from 'node:path'
import type { SvgScreenshotOptions } from '../SvgScreenshotOptions/SvgScreenshotOptions.ts'
import * as CaptureSvgScreenshot from '../CaptureSvgScreenshot/CaptureSvgScreenshot.ts'
import * as GetTestState from '../GetTestState/GetTestState.ts'
import * as PageMessages from '../PageMessages/PageMessages.ts'
import * as TestServerHost from '../TestServerHost/TestServerHost.ts'
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
  const url = new URL(`http://${TestServerHost.testServerHost}:${port}/tests/${htmlFileName}`)
  if (traceFocus) {
    url.searchParams.set('traceFocus', 'true')
  }
  if (traceRendererWorker) {
    url.searchParams.set('traceRendererWorker', 'true')
  }
  return url.href
}

export const navigateToTest = async (page: Page, url: string, browser?: string): Promise<void> => {
  await page.goto(url, {
    waitUntil: browser === 'webkit' ? 'commit' : 'domcontentloaded',
  })
}

export const runTest = async ({
  browser,
  failOnConsoleMessages,
  page,
  port,
  svgScreenshotOptions,
  test,
  testSrc,
  timeout,
  traceFocus,
  traceRendererWorker,
}: {
  readonly browser?: string
  readonly test: string
  readonly page: Page
  readonly testSrc: string
  readonly port: number
  readonly timeout: number
  readonly traceFocus?: boolean
  readonly traceRendererWorker?: boolean
  readonly failOnConsoleMessages?: boolean
  readonly svgScreenshotOptions?: SvgScreenshotOptions
}): Promise<any> => {
  const start = performance.now()
  const pageMessages = failOnConsoleMessages ? PageMessages.createPageMessages(page) : undefined
  let result: any
  try {
    const url = getUrlFromTestFile(test, port, traceFocus ?? false, traceRendererWorker ?? false)
    await navigateToTest(page, url, browser)
    const testOverlay = page.locator('#TestOverlay')
    await testOverlay.waitFor({
      state: 'visible',
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
    result = {
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
    result = {
      end,
      error: message,
      name: test,
      start,
      status: TestState.Fail,
    }
  } finally {
    pageMessages?.dispose()
  }
  if (pageMessages && pageMessages.messages.length > 0) {
    const messages = PageMessages.formatPageMessages(pageMessages.messages)
    result = {
      ...result,
      error: result.error ? `${result.error}\n${messages}` : messages,
      status: TestState.Fail,
    }
  }
  return result
}
