import { chromium } from '@playwright/test'

/**
 *
 * @param {{signal:AbortSignal, headless:boolean}} options
 * @returns
 */
export const startBrowser = async ({
  signal,
  headless,
}: {
  readonly signal: AbortSignal
  readonly headless: boolean
}): Promise<{ browser: any; page: any }> => {
  const browser = await chromium.launch({
    headless,
  })
  const page = await browser.newPage()
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  signal.addEventListener('abort', async () => {
    await page.close()
    await browser.close()
  })
  // @ts-ignore
  return {
    browser,
    page,
  }
}
