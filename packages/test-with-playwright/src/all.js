import { expect } from '@playwright/test'
import { readdirSync } from 'node:fs'
import { basename, join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { closeAll, getRoot, runTest, startAll, state } from './main.js'

/**
 * @param {string} root
 */
const getTestFiles = async (root) => {
  return readdirSync(root).map((x) => join(root, x))
}

/**
 * @param {string} absolutePath
 * @param {number} port
 */
const getUrlFromTestFile = (absolutePath, port) => {
  const baseName = basename(absolutePath)
  const htmlFileName = baseName.replace('.js', '.html')
  return `http://localhost:${port}/tests/${htmlFileName}`
}

/**
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} url
 */
const executeSingleTest = async (page, url) => {
  await page.goto(url)
  const testOverlay = page.locator('#TestOverlay')
  await expect(testOverlay).toBeVisible({ timeout: 25_000 })
  const text = await testOverlay.textContent()
  const state = await testOverlay.getAttribute('data-state')
  switch (state) {
    case 'pass':
      return {
        status: 'pass',
      }
    case 'skip':
      return {
        status: 'skip',
      }
    case 'fail':
      return {
        status: 'fail',
        error: `${text}`,
      }
    default:
      throw new Error(`unexpected test state: ${state}`)
  }
}

const main = async () => {
  try {
    let skipped = 0
    let passed = 0
    const start = performance.now()
    const { page, port } = await startAll()
    console.info('SETUP COMPLETE')
    const root = await getRoot()
    const testFiles = await getTestFiles(join(root, 'src'))
    console.log({ testFiles })
    for (const testFile of testFiles) {
      const url = getUrlFromTestFile(testFile, port)
      const name = basename(testFile)
      const result = await executeSingleTest(page, url)
      switch (result.status) {
        case 'pass':
          console.info(`test passed ${name}`)
          passed++
          break
        case 'skip':
          console.info(`test skipped ${name}`)
          skipped++
          break
        case 'fail':
          throw new Error(`Test Failed ${name}: ${result.error}`)
      }
    }
    const end = performance.now()
    const duration = end - start
    if (skipped) {
      console.info(
        `${passed} tests passed, ${skipped} tests skipped in ${duration}ms`
      )
    } else {
      console.info(`${passed} tests passed in ${duration}ms`)
    }
  } catch (error) {
    console.info('tests failed')
    console.error(error)
    process.exit(1)
  } finally {
    await closeAll()
  }
}

main()
