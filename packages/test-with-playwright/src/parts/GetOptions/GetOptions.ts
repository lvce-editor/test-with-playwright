import * as ParseCliArgs from '../ParseCliArgs/ParseCliArgs.ts'
import * as ParseEnv from '../ParseEnv/ParseEnv.ts'

type Browser = 'chromium' | 'firefox'

interface Options {
  browser: Browser
  extensionPath: string
  filter?: string
  headless: boolean
  onlyExtension?: string
  serverPath?: string
  testPath: string
  traceFocus?: boolean
}

const defaultOptions: Options = {
  browser: 'chromium',
  extensionPath: '',
  headless: false,
  testPath: '',
}

interface GetOptionsParams {
  argv: string[]
  env: NodeJS.ProcessEnv
}

const isBrowser = (value: string): value is Browser => {
  return value === 'chromium' || value === 'firefox'
}

export const getOptions = ({ argv, env }: Readonly<GetOptionsParams>): Options => {
  const parsedEnv = ParseEnv.parseEnv(env)
  const parsedArgs = ParseCliArgs.parseCliArgs(argv)
  if (parsedArgs.browser && !isBrowser(parsedArgs.browser)) {
    throw new Error(`[test-with-playwright] unsupported browser: ${parsedArgs.browser}`)
  }
  return {
    ...defaultOptions,
    ...parsedEnv,
    ...parsedArgs,
  }
}
