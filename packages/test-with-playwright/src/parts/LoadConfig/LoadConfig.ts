import { stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { E2eConfig } from '../E2eConfig/E2eConfig.ts'
import * as ValidateConfig from '../ValidateConfig/ValidateConfig.ts'

const pathOptions = [
  'onlyExtension',
  'testPath',
  'serverPath',
  'electronPath',
  'electronCacheDir',
  'svgScreenshotDir',
] as const

const isFile = async (path: string): Promise<boolean> => {
  try {
    const result = await stat(path)
    return result.isFile()
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false
    }
    throw error
  }
}

const importConfig = async (path: string): Promise<E2eConfig> => {
  try {
    const module = await import(pathToFileURL(path).href)
    const config = { ...ValidateConfig.validateConfig(module.default) }
    for (const key of pathOptions) {
      if (config[key] !== undefined) {
        config[key] = resolve(dirname(path), config[key])
      }
    }
    return config
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`[test-with-playwright] failed to load ${path}: ${message}`, { cause: error })
  }
}

export const loadConfig = async (cwd: string): Promise<E2eConfig> => {
  let directory = resolve(cwd)
  while (true) {
    const path = join(directory, 'e2e.config.js')
    if (await isFile(path)) {
      return importConfig(path)
    }
    const parent = dirname(directory)
    if (parent === directory) {
      return {}
    }
    directory = parent
  }
}
