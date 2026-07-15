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
  updateSvgScreenshots: false,
}

interface GetOptionsParams {
  argv: string[]
  env: NodeJS.ProcessEnv
}

const isBrowser = (value: string): value is Browser => {
  return browsers.includes(value as Browser)
}

const isRuntime = (value: string): value is Runtime => {
  return value === 'browser' || value === 'electron'
}

export const getOptions = ({ argv, env }: Readonly<GetOptionsParams>): Options => {
  const parsedEnv = ParseEnv.parseEnv(env)
  const parsedArgs = ParseCliArgs.parseCliArgs(argv)
  if (parsedArgs.browser !== undefined && !isBrowser(parsedArgs.browser)) {
    throw new Error(`[test-with-playwright] unsupported browser: ${parsedArgs.browser}`)
  }
  if (parsedArgs.runtime !== undefined && !isRuntime(parsedArgs.runtime)) {
    throw new Error(`[test-with-playwright] unsupported runtime: ${parsedArgs.runtime}`)
  }
  const browser = parsedArgs.browser ?? defaultOptions.browser
  const runtime = parsedArgs.runtime ?? defaultOptions.runtime
  if (parsedArgs.coverage && runtime === 'browser' && browser !== 'chromium') {
    throw new Error('[test-with-playwright] --coverage is only supported with Chromium-based browsers')
  }
  if (parsedArgs.reusePage && runtime === 'electron') {
    throw new Error('[test-with-playwright] --reuse-page is only supported with --runtime=browser')
  }
  if (parsedArgs.reusePage && parsedArgs.svgScreenshotDir) {
    throw new Error('[test-with-playwright] --svg-screenshot-dir is not supported with --reuse-page')
  }
  if (parsedArgs.updateSvgScreenshots && !parsedArgs.svgScreenshotDir) {
    throw new Error('[test-with-playwright] --update-svg-screenshots requires --svg-screenshot-dir')
  }
  if (parsedArgs.svgScreenshotSelector && !parsedArgs.svgScreenshotDir) {
    throw new Error('[test-with-playwright] --svg-screenshot-selector requires --svg-screenshot-dir')
  }
  const reusePage = parsedArgs.reusePage ?? defaultOptions.reusePage
  const timeout = parsedArgs.timeout ?? (reusePage ? reusePageDefaultTimeout : defaultTimeout)
  return {
    ...defaultOptions,
    ...parsedEnv,
    ...parsedArgs,
    browser,
    reusePage,
    runtime,
    timeout,
  }
}
