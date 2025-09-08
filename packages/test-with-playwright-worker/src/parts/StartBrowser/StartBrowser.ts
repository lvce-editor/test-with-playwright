import { chromium } from '@playwright/test'

/**
 *
 * @param {{signal:AbortSignal, headless:boolean}} options
 * @returns
 */
export const startBrowser = async ({ signal, headless }): Promise<void> => {
  const browser = await chromium.launch({
    headless,
  })
  const page = await browser.newPage()
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
