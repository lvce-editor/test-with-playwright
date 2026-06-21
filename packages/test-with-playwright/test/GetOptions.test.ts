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

test('getOptions defaults reusePage to false', () => {
  const options = GetOptions.getOptions({
    argv: [],
    env: {},
  })

  expect(options.reusePage).toBe(false)
})

test('getOptions defaults timeout to 30 seconds', () => {
  const options = GetOptions.getOptions({
    argv: [],
    env: {},
  })

  expect(options.timeout).toBe(30_000)
})

test('getOptions reads reusePage from cli args', () => {
  const options = GetOptions.getOptions({
    argv: ['--reuse-page'],
    env: {},
  })

  expect(options.reusePage).toBe(true)
})

test('getOptions defaults timeout to 10 minutes for reused page', () => {
  const options = GetOptions.getOptions({
    argv: ['--reuse-page'],
    env: {},
  })

  expect(options.timeout).toBe(600_000)
})

test('getOptions reads timeout from cli args', () => {
  const options = GetOptions.getOptions({
    argv: ['--timeout=45000', '--reuse-page'],
    env: {},
  })

  expect(options.timeout).toBe(45_000)
})

test('getOptions throws for unsupported browser', () => {
  expect(() =>
    GetOptions.getOptions({
      argv: ['--browser=edge'],
      env: {},
    }),
  ).toThrow(new Error('[test-with-playwright] unsupported browser: edge'))
})

test('getOptions throws for reusePage with electron runtime', () => {
  expect(() =>
    GetOptions.getOptions({
      argv: ['--runtime=electron', '--reuse-page'],
      env: {},
    }),
  ).toThrow(new Error('[test-with-playwright] --reuse-page is only supported with --runtime=browser'))
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
