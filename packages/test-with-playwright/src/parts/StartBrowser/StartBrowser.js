import { chromium } from '@playwright/test'

/**
 *
 * @param {{signal:AbortSignal, headless:boolean}} options
 * @returns
 */
export const startBrowser = async ({ signal, headless }) => {
  const browser = await chromium.launch({
    headless,
  })
  const page = await browser.newPage()
  signal.addEventListener('abort', async () => {
    await page.close()
    await browser.close()
  })
  return {
    browser,
    page,
  }
}
