import { expect, test } from '@jest/globals'
import * as GetBrowserLaunchArgs from '../src/parts/GetBrowserLaunchArgs/GetBrowserLaunchArgs.ts'

test.each([
  ['chromium', 'linux'],
  ['chromium', 'darwin'],
  ['firefox', 'win32'],
  ['webkit', 'win32'],
] as const)('keeps %s on %s launch options unchanged', (browser, platform) => {
  expect(GetBrowserLaunchArgs.getBrowserLaunchArgs(browser, platform)).toEqual([])
})
