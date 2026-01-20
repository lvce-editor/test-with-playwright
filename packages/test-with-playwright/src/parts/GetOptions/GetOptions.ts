import * as ParseCliArgs from '../ParseCliArgs/ParseCliArgs.ts'
import * as ParseEnv from '../ParseEnv/ParseEnv.ts'

interface Options {
  extensionPath: string
  headless: boolean
  onlyExtension?: string
  serverPath?: string
  testPath: string
  traceFocus?: boolean
}

const defaultOptions: Options = {
  extensionPath: '',
  headless: false,
  testPath: '',
}

interface GetOptionsParams {
  argv: string[]
  env: NodeJS.ProcessEnv
}

export const getOptions = ({ argv, env }: Readonly<GetOptionsParams>): Options => {
  const parsedEnv = ParseEnv.parseEnv(env)
  const parsedArgs = ParseCliArgs.parseCliArgs(argv)
  return {
    ...defaultOptions,
    ...parsedEnv,
    ...parsedArgs,
  }
}
