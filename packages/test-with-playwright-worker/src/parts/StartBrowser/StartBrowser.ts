import type { chromium as PlaywrightChromium } from '@playwright/test'
import * as PatchPlaywrightFirefoxWorkerWebSocket from '../PatchPlaywrightFirefoxWorkerWebSocket/PatchPlaywrightFirefoxWorkerWebSocket.ts'

type Browser = 'chromium' | 'firefox' | 'webkit'
type BrowserLauncher = typeof PlaywrightChromium

/**
 *
 * @param {{browser:'chromium'|'firefox'|'webkit', signal:AbortSignal, headless:boolean}} options
 * @returns
 */
const getLauncher = async (browser: Browser): Promise<BrowserLauncher> => {
  const { chromium, firefox, webkit } = await import('@playwright/test')
  switch (browser) {
    case 'chromium':
      return chromium
    case 'firefox':
      return firefox
    case 'webkit':
      return webkit
  }
}

export const startBrowser = async ({
  browser,
  headless,
  signal,
}: {
  readonly browser: Browser
  readonly signal: AbortSignal
  readonly headless: boolean
}): Promise<{ browser: any; page: any }> => {
  if (browser === 'firefox') {
    await PatchPlaywrightFirefoxWorkerWebSocket.patchPlaywrightFirefoxWorkerWebSocket()
  }
  const launcher = await getLauncher(browser)
  const browserInstance = await launcher.launch({
    headless,
  })
  const page = await browserInstance.newPage()
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  signal.addEventListener('abort', async () => {
    await page.close()
    await browserInstance.close()
  })
  // @ts-ignore
  return {
    browser: browserInstance,
    page,
  }
}
