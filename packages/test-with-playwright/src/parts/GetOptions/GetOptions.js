import * as ParseCliArgs from '../ParseCliArgs/ParseCliArgs.js'
import * as ParseEnv from '../ParseEnv/ParseEnv.js'

const defaultOptions = {
  testPath: '',
  extensionPath: '',
  headless: false,
}

export const getOptions = ({ argv, env }) => {
  const parsedEnv = ParseEnv.parseEnv(env)
  const parsedArgs = ParseCliArgs.parseCliArgs(argv)
  return {
    ...defaultOptions,
    ...parsedEnv,
    ...parsedArgs,
  }
}
