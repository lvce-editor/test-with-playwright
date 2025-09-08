import { chromium } from '@playwright/test'

/**
 *
 * @param {{signal:AbortSignal, headless:boolean}} options
 * @returns
 */
export const startBrowser = async ({ signal, headless }: Readonly<{ signal: AbortSignal; headless: boolean }>): Promise<{ browser: any; page: any }> => {
  const browser = await chromium.launch({
    headless,
  })
  const page = await browser.newPage()
  signal.addEventListener('abort', () => {
    void page.close()
    void browser.close()
  })
  return {
    browser,
    page,
  }
}
