import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import * as GetTestState from '../GetTestState/GetTestState.ts'
import * as GetTestUrl from '../GetTestUrl/GetTestUrl.ts'
import * as TestState from '../TestState/TestState.ts'

export const runTest = async ({
  page,
  port,
  test,
  testSrc,
  timeout,
  traceFocus,
}: {
  readonly test: string
  readonly page: Page
  readonly testSrc: string
  readonly port: number
  readonly timeout: number
  readonly traceFocus?: boolean
}): Promise<any> => {
  const start = performance.now()
  try {
    const url = GetTestUrl.getTestUrl({ port, test, traceFocus })
    await page.goto(url, {
      waitUntil: 'networkidle',
    })
    const testOverlay = page.locator('#TestOverlay')
    await expect(testOverlay).toBeVisible({
      timeout,
    })
    const text = await testOverlay.textContent()
    const testOverlayState = await testOverlay.getAttribute('data-state')
    // @ts-ignore
    const testState = GetTestState.getTestState(testOverlayState, text || '')
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
  }
}
