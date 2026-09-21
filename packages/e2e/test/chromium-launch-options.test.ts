import { expect, test } from '@jest/globals'
import { chromium } from '@playwright/test'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { root } from '../src/root.ts'

const source = join(root, 'packages/test-with-playwright-worker/src/parts/GetBrowserLaunchArgs/GetBrowserLaunchArgs.ts')
const { getBrowserLaunchArgs } = await import(pathToFileURL(source).href)
const browserName = process.env['TEST_WITH_PLAYWRIGHT_BROWSER'] || 'chromium'

const getDisabledFeatures = async (args: string[]): Promise<string[]> => {
  const browser = await chromium.launch({ args: ['--enable-automation', ...args], headless: true })
  try {
    const session = await browser.newBrowserCDPSession()
    const { arguments: commandLine } = await session.send('Browser.getBrowserCommandLine')
    const argument = commandLine.findLast((value) => value.startsWith('--disable-features='))
    if (!argument) throw new Error('Missing disabled features in browser command line')
    return argument.slice('--disable-features='.length).split(',')
  } finally {
    await browser.close()
  }
}

test('Windows port allocation workaround preserves Playwright launch options', async () => {
  const args = getBrowserLaunchArgs(browserName, 'win32')
  const baseline = browserName === 'chromium' ? await getDisabledFeatures([]) : []
  const candidate = browserName === 'chromium' ? await getDisabledFeatures(args) : args
  const expected = browserName === 'chromium' ? [...baseline, 'TcpPortRandomizationWin'] : baseline
  expect(new Set(candidate)).toEqual(new Set(expected))
})
