import type { chromium as PlaywrightChromium } from '@playwright/test'
import * as GetBrowserLaunchArgs from '../GetBrowserLaunchArgs/GetBrowserLaunchArgs.ts'
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
}): Promise<{ browser: any; page: any; dispose: () => Promise<void> }> => {
  if (browser === 'firefox') {
    await PatchPlaywrightFirefoxWorkerWebSocket.patchPlaywrightFirefoxWorkerWebSocket()
  }
  const launcher = await getLauncher(browser)
  signal.throwIfAborted()
  const options = {
    args: GetBrowserLaunchArgs.getBrowserLaunchArgs(browser),
    headless,
  }
  // Chromium 153 crashes when restoring OPFS handles from its in-memory IndexedDB backend.
  // An empty userDataDir gives each run a temporary disk-backed profile managed by Playwright.
  const browserInstance =
    browser === 'chromium' ? await launcher.launchPersistentContext('', options) : await launcher.launch(options)
  let disposal: Promise<void> | undefined
  const dispose = (): Promise<void> => {
    signal.removeEventListener('abort', handleAbort)
    disposal ||= browserInstance.close()
    return disposal
  }
  const handleAbort = (): void => {
    // The caller awaits disposal during teardown, including any cleanup error.
    void dispose().catch(() => {})
  }
  signal.addEventListener('abort', handleAbort, { once: true })
  try {
    signal.throwIfAborted()
    const page = await browserInstance.newPage()
    signal.throwIfAborted()
    return { browser: browserInstance, dispose, page }
  } catch (error) {
    await dispose()
    throw error
  }
}
