import * as ParseCliArgs from '../ParseCliArgs/ParseCliArgs.ts'
import * as ParseEnv from '../ParseEnv/ParseEnv.ts'

type Browser = 'chromium' | 'firefox'
type Runtime = 'browser' | 'electron'

interface Options {
  browser: Browser
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
  runtime: Runtime
  serverPath?: string
  testPath: string
  traceFocus?: boolean
}

const defaultOptions: Options = {
  browser: 'chromium',
  extensionPath: '',
  headless: false,
  help: false,
  runtime: 'browser',
  testPath: '',
}

interface GetOptionsParams {
  argv: string[]
  env: NodeJS.ProcessEnv
}

const isBrowser = (value: string): value is Browser => {
  return value === 'chromium' || value === 'firefox'
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
  return {
    ...defaultOptions,
    ...parsedEnv,
    ...parsedArgs,
    browser,
    runtime,
  }
}
