import { chromium, firefox, webkit } from '@playwright/test'

type Browser = 'chromium' | 'firefox' | 'webkit'

/**
 *
 * @param {{browser:'chromium'|'firefox'|'webkit', signal:AbortSignal, headless:boolean}} options
 * @returns
 */
const getLauncher = (browser: Browser): typeof chromium => {
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
  const launcher = getLauncher(browser)
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
