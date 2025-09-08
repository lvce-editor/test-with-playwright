import { expect } from '@playwright/test'
import { basename } from 'node:path'
import * as GetTestState from '../GetTestState/GetTestState.ts'

/**
 * @param {string} absolutePath
 * @param {number} port
 */
const getUrlFromTestFile = (absolutePath, port) => {
  const baseName = basename(absolutePath)
  const htmlFileName = baseName.slice(0, -'.js'.length) + '.html'
  return `http://localhost:${port}/tests/${htmlFileName}`
}

export const runTest = async ({ test, page, testSrc, port, timeout }): Promise<void> => {
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
  const testState = GetTestState.getTestState(testOverlayState)
  const end = performance.now()
  return {
    ...testState,
    name: test,
    start,
    end,
    error: text,
  }
}
