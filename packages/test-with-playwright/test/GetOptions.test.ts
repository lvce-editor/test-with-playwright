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

test('getOptions defaults renderer worker tracing to false', () => {
  const options = GetOptions.getOptions({
    argv: [],
    env: {},
  })

  expect(options.traceRendererWorker).toBe(false)
})

test('getOptions reads renderer worker tracing from cli args', () => {
  const options = GetOptions.getOptions({
    argv: ['--trace-renderer-worker'],
    env: {},
  })

  expect(options.traceRendererWorker).toBe(true)
})

test('getOptions rejects renderer worker tracing with electron runtime', () => {
  expect(() =>
    GetOptions.getOptions({
      argv: ['--runtime=electron', '--trace-renderer-worker'],
      env: {},
    }),
  ).toThrow(new Error('[test-with-playwright] --trace-renderer-worker is only supported with --runtime=browser'))
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

test('CLI overrides config while omitted CLI flags preserve config values', () => {
  const options = GetOptions.getOptions({
    argv: ['--headless', '--timeout=5000', '--electron-arg=--new', '--filter='],
    config: { headless: false, reusePage: true, timeout: 9000, electronArgs: ['--old'], filter: 'old' },
    env: {},
  })
  expect(options).toMatchObject({ headless: true, reusePage: true, timeout: 5000, electronArgs: ['--new'], filter: '' })
})

test('explicit false CLI flags override configured true values', () => {
  const options = GetOptions.getOptions({
    argv: [
      '--no-headless',
      '--reuse-page=false',
      '--no-coverage',
      '--no-trace-focus',
      '--no-trace-renderer-worker',
      '--no-update-svg-screenshots',
    ],
    config: {
      headless: true,
      reusePage: true,
      coverage: true,
      traceFocus: true,
      traceRendererWorker: true,
      updateSvgScreenshots: true,
    },
    env: {},
  })
  expect(options).toMatchObject({
    headless: false,
    reusePage: false,
    coverage: false,
    traceFocus: false,
    traceRendererWorker: false,
    updateSvgScreenshots: false,
    timeout: 30_000,
  })
})

test('environment overrides config and CLI overrides environment', () => {
  const options = GetOptions.getOptions({
    argv: ['--test-path=cli-tests'],
    config: { onlyExtension: 'config-extension', testPath: 'config-tests' },
    env: { ONLY_EXTENSION: 'env-extension', TEST_PATH: 'env-tests' },
  })
  expect(options).toMatchObject({ onlyExtension: 'env-extension', testPath: 'cli-tests' })
})

test('config reusePage selects the longer default timeout', () => {
  expect(GetOptions.getOptions({ argv: [], config: { reusePage: true }, env: {} }).timeout).toBe(600_000)
})

test('validates combinations after applying CLI overrides', () => {
  const config = { coverage: true, browser: 'firefox' } as const
  expect(() => GetOptions.getOptions({ argv: [], config, env: {} })).toThrow('only supported with Chromium')
  expect(GetOptions.getOptions({ argv: ['--browser=chromium'], config, env: {} }).browser).toBe('chromium')
})
