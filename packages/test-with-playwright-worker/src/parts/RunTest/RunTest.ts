import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { basename } from 'node:path'
import * as GetTestState from '../GetTestState/GetTestState.ts'

/**
 * @param {string} absolutePath
 * @param {number} port
 */
const getUrlFromTestFile = (absolutePath: string, port: number): string => {
  const baseName = basename(absolutePath)
  const htmlFileName = baseName.slice(0, -'.js'.length) + '.html'
  return `http://localhost:${port}/tests/${htmlFileName}`
}

export const runTest = async ({
  test,
  page,
  testSrc,
  port,
  timeout,
}: {
  readonly test: string
  readonly page: Page
  readonly testSrc: string
  readonly port: number
  readonly timeout: number
}): Promise<void> => {
  const start = performance.now()
  const url = getUrlFromTestFile(test, port)
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
    name: test,
    start,
    end,
    error: text,
  }
}
