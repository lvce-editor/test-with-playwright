import { chromium, firefox } from '@playwright/test'

/**
 *
 * @param {{browser:'chromium'|'firefox', signal:AbortSignal, headless:boolean}} options
 * @returns
 */
export const startBrowser = async ({
  browser,
  headless,
  signal,
}: {
  readonly browser: 'chromium' | 'firefox'
  readonly signal: AbortSignal
  readonly headless: boolean
}): Promise<{ browser: any; page: any }> => {
  const launcher = browser === 'firefox' ? firefox : chromium
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
