import * as ParseCliArgs from '../ParseCliArgs/ParseCliArgs.ts'
import * as ParseEnv from '../ParseEnv/ParseEnv.ts'

interface Options {
  testPath: string
  extensionPath: string
  headless: boolean
  onlyExtension?: string
}

const defaultOptions: Options = {
  testPath: '',
  extensionPath: '',
  headless: false,
}

interface GetOptionsParams {
  argv: string[]
  env: NodeJS.ProcessEnv
}

export const getOptions = ({ argv, env }: GetOptionsParams): Options => {
  const parsedEnv = ParseEnv.parseEnv(env)
  const parsedArgs = ParseCliArgs.parseCliArgs(argv)
  return {
    ...defaultOptions,
    ...parsedEnv,
    ...parsedArgs,
  }
}
