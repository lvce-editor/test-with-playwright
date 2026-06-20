import { expect, test } from '@jest/globals'
import * as GetOptions from '../src/parts/GetOptions/GetOptions.ts'

test('getOptions reads browser from cli args', () => {
  const options = GetOptions.getOptions({
    argv: ['--browser=firefox'],
    env: {},
  })

  expect(options.browser).toBe('firefox')
})

test('getOptions reads webkit browser from cli args', () => {
  const options = GetOptions.getOptions({
    argv: ['--browser=webkit'],
    env: {},
  })

  expect(options.browser).toBe('webkit')
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
      argv: ['--browser=edge'],
      env: {},
    }),
  ).toThrow(new Error('[test-with-playwright] unsupported browser: edge'))
})

test('getOptions reads help from cli args', () => {
  const options = GetOptions.getOptions({
    argv: ['--help'],
    env: {},
  })

  expect(options.help).toBe(true)
})

test('getOptions reads short help from cli args', () => {
  const options = GetOptions.getOptions({
    argv: ['-h'],
    env: {},
  })

  expect(options.help).toBe(true)
})
