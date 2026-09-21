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

test('Windows Chromium retains default disabled features when adding the port workaround', () => {
  const args = GetBrowserLaunchArgs.getBrowserLaunchArgs('chromium', 'win32')
  expect(args).toHaveLength(1)
  const features = args[0].slice('--disable-features='.length).split(',')
  expect(features).toEqual(expect.arrayContaining(['MediaRouter', 'Translate', 'TcpPortRandomizationWin']))
})

test('uses the current platform when it is omitted', () => {
  expect(GetBrowserLaunchArgs.getBrowserLaunchArgs('firefox')).toEqual([])
})
