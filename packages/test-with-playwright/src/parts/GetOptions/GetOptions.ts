import type { E2eConfig } from '../E2eConfig/E2eConfig.ts'
import * as ParseCliArgs from '../ParseCliArgs/ParseCliArgs.ts'
import * as ParseEnv from '../ParseEnv/ParseEnv.ts'

const browsers = ['chromium', 'firefox', 'webkit'] as const

type Browser = (typeof browsers)[number]
type Runtime = 'browser' | 'electron'

interface Options {
  browser: Browser
  coverage: boolean
  electronArgs?: string[]
  electronCacheDir?: string
  electronEnv?: string[]
  electronPath?: string
  electronVersion?: string
  extensionPath: string
  filter?: string
  headless: boolean
  help: boolean
  onlyExtension?: string
  reusePage: boolean
  runtime: Runtime
  serverPath?: string
  svgScreenshotDir?: string
  svgScreenshotSelector?: string
  testPath: string
  timeout: number
  traceFocus?: boolean
  traceRendererWorker: boolean
  updateSvgScreenshots: boolean
}

const defaultTimeout = 30_000
const reusePageDefaultTimeout = 600_000

const defaultOptions: Options = {
  browser: 'chromium',
  coverage: false,
  extensionPath: '',
  headless: false,
  help: false,
  reusePage: false,
  runtime: 'browser',
  testPath: '',
  timeout: defaultTimeout,
  traceRendererWorker: false,
  updateSvgScreenshots: false,
}

interface GetOptionsParams {
  argv: string[]
  config?: E2eConfig
  env: NodeJS.ProcessEnv
}

const isBrowser = (value: string): value is Browser => {
  return browsers.includes(value as Browser)
}

const isRuntime = (value: string): value is Runtime => {
  return value === 'browser' || value === 'electron'
}

const validateRendererWorkerTrace = (traceRendererWorker: boolean | undefined, runtime: Runtime): void => {
  if (traceRendererWorker && runtime === 'electron') {
    throw new Error('[test-with-playwright] --trace-renderer-worker is only supported with --runtime=browser')
  }
}

export const getOptions = ({ argv, config = {}, env }: Readonly<GetOptionsParams>): Options => {
  const parsedEnv = ParseEnv.parseEnv(env)
  const mergedOptions = { ...config, ...parsedEnv, ...ParseCliArgs.parseCliArgs(argv) }
  if (mergedOptions.browser !== undefined && !isBrowser(mergedOptions.browser)) {
    throw new Error(`[test-with-playwright] unsupported browser: ${mergedOptions.browser}`)
  }
  if (mergedOptions.runtime !== undefined && !isRuntime(mergedOptions.runtime)) {
    throw new Error(`[test-with-playwright] unsupported runtime: ${mergedOptions.runtime}`)
  }
  const browser = mergedOptions.browser ?? defaultOptions.browser
  const runtime = mergedOptions.runtime ?? defaultOptions.runtime
  if (mergedOptions.coverage && runtime === 'browser' && browser !== 'chromium') {
    throw new Error('[test-with-playwright] --coverage is only supported with Chromium-based browsers')
  }
  if (mergedOptions.reusePage && runtime === 'electron') {
    throw new Error('[test-with-playwright] --reuse-page is only supported with --runtime=browser')
  }
  validateRendererWorkerTrace(mergedOptions.traceRendererWorker, runtime)
  if (mergedOptions.reusePage && mergedOptions.svgScreenshotDir) {
    throw new Error('[test-with-playwright] --svg-screenshot-dir is not supported with --reuse-page')
  }
  if (mergedOptions.updateSvgScreenshots && !mergedOptions.svgScreenshotDir) {
    throw new Error('[test-with-playwright] --update-svg-screenshots requires --svg-screenshot-dir')
  }
  if (mergedOptions.svgScreenshotSelector && !mergedOptions.svgScreenshotDir) {
    throw new Error('[test-with-playwright] --svg-screenshot-selector requires --svg-screenshot-dir')
  }
  const reusePage = mergedOptions.reusePage ?? defaultOptions.reusePage
  const timeout = mergedOptions.timeout ?? (reusePage ? reusePageDefaultTimeout : defaultTimeout)
  return {
    ...defaultOptions,
    ...mergedOptions,
    browser,
    reusePage,
    runtime,
    timeout,
  }
}
