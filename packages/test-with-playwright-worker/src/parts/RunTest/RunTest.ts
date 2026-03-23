import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { basename } from 'node:path'
import * as GetTestState from '../GetTestState/GetTestState.ts'
import * as TestState from '../TestState/TestState.ts'

/**
 * @param {string} absolutePath
 * @param {number} port
 * @param {boolean} traceFocus
 */
const getUrlFromTestFile = (absolutePath: string, port: number, traceFocus?: boolean): string => {
  const baseName = basename(absolutePath)
  const htmlFileName = baseName.slice(0, -'.js'.length) + '.html'
  const baseUrl = `http://localhost:${port}/tests/${htmlFileName}`
  if (traceFocus) {
    return `${baseUrl}?traceFocus=true`
  }
  return baseUrl
}

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
    const url = getUrlFromTestFile(test, port, traceFocus)
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
    const testState = GetTestState.getTestState(testOverlayState)
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
    const message = error instanceof Error ? error.message : `${error}`
    return {
      end,
      error: message,
      name: test,
      start,
      status: TestState.Fail,
    }
  }
}
