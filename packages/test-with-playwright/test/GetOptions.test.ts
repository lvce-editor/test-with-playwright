import { expect, test } from '@jest/globals'
import * as GetOptions from '../src/parts/GetOptions/GetOptions.ts'

test('getOptions reads browser from cli args', () => {
  const options = GetOptions.getOptions({
    argv: ['--browser=firefox'],
    env: {},
  })

  expect(options.browser).toBe('firefox')
})

test('getOptions defaults browser to chromium', () => {
  const options = GetOptions.getOptions({
    argv: [],
    env: {},
  })

  expect(options.browser).toBe('chromium')
})

test('getOptions throws for unsupported browser', () => {
  expect(() =>
    GetOptions.getOptions({
      argv: ['--browser=webkit'],
      env: {},
    }),
  ).toThrow(new Error('[test-with-playwright] unsupported browser: webkit'))
})
