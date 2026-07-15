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

test('getOptions defaults coverage to false', () => {
  const options = GetOptions.getOptions({
    argv: [],
    env: {},
  })

  expect(options.coverage).toBe(false)
})

test('getOptions reads coverage from cli args', () => {
  const options = GetOptions.getOptions({
    argv: ['--coverage'],
    env: {},
  })

  expect(options.coverage).toBe(true)
})

test('getOptions rejects coverage in Firefox', () => {
  expect(() =>
    GetOptions.getOptions({
      argv: ['--coverage', '--browser=firefox'],
      env: {},
    }),
  ).toThrow(new Error('[test-with-playwright] --coverage is only supported with Chromium-based browsers'))
})

test('getOptions rejects coverage in WebKit', () => {
  expect(() =>
    GetOptions.getOptions({
      argv: ['--coverage', '--browser=webkit'],
      env: {},
    }),
  ).toThrow(new Error('[test-with-playwright] --coverage is only supported with Chromium-based browsers'))
})

test('getOptions supports coverage in Electron', () => {
  const options = GetOptions.getOptions({
    argv: ['--coverage', '--runtime=electron'],
    env: {},
  })

  expect(options.coverage).toBe(true)
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

test('getOptions rejects SVG screenshots with reused page', () => {
  expect(() =>
    GetOptions.getOptions({
      argv: ['--reuse-page', '--svg-screenshot-dir=./snapshots'],
      env: {},
    }),
  ).toThrow(new Error('[test-with-playwright] --svg-screenshot-dir is not supported with --reuse-page'))
})

test('getOptions requires an SVG screenshot directory when updating', () => {
  expect(() =>
    GetOptions.getOptions({
      argv: ['--update-svg-screenshots'],
      env: {},
    }),
  ).toThrow(new Error('[test-with-playwright] --update-svg-screenshots requires --svg-screenshot-dir'))
})

test('getOptions requires an SVG screenshot directory with a selector', () => {
  expect(() =>
    GetOptions.getOptions({
      argv: ['--svg-screenshot-selector=.Explorer'],
      env: {},
    }),
  ).toThrow(new Error('[test-with-playwright] --svg-screenshot-selector requires --svg-screenshot-dir'))
})
