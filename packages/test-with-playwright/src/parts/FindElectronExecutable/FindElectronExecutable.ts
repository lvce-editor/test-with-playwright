import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

const isWindowsExecutable = (entry: string): boolean => {
  return entry.toLowerCase().endsWith('.exe') && entry.toLowerCase().includes('lvce')
}

const isMacosExecutable = (entry: string): boolean => {
  return entry.endsWith('.app')
}

const findFile = async (directory: string, predicate: (entry: string) => boolean): Promise<string | undefined> => {
  const entries = await readdir(directory, { withFileTypes: true })
  for (const entry of entries) {
    const absolutePath = join(directory, entry.name)
    if (entry.isDirectory()) {
      const nestedResult = await findFile(absolutePath, predicate)
      if (nestedResult) {
        return nestedResult
      }
      continue
    }
    if (entry.isFile() && predicate(entry.name)) {
      return absolutePath
    }
  }
  return undefined
}

const findApp = async (directory: string): Promise<string | undefined> => {
  const entries = await readdir(directory, { withFileTypes: true })
  for (const entry of entries) {
    const absolutePath = join(directory, entry.name)
    if (entry.isDirectory() && isMacosExecutable(entry.name)) {
      return absolutePath
    }
    if (entry.isDirectory()) {
      const nestedResult = await findApp(absolutePath)
      if (nestedResult) {
        return nestedResult
      }
    }
  }
  return undefined
}

const findMacosExecutable = async (directory: string): Promise<string | undefined> => {
  const app = await findApp(directory)
  if (!app) {
    return undefined
  }
  const macosDirectory = join(app, 'Contents', 'MacOS')
  const entries = await readdir(macosDirectory)
  for (const entry of entries) {
    const absolutePath = join(macosDirectory, entry)
    const fileStat = await stat(absolutePath)
    if (fileStat.isFile()) {
      return absolutePath
    }
  }
  return undefined
}

export const findElectronExecutable = async ({
  directory,
  platform,
}: {
  readonly directory: string
  readonly platform: string
}): Promise<string> => {
  if (platform === 'darwin') {
    const executable = await findMacosExecutable(directory)
    if (executable) {
      return executable
    }
  }
  const predicate = platform === 'win32' ? isWindowsExecutable : (entry: string): boolean => entry === 'lvce'
  const executable = await findFile(directory, predicate)
  if (executable) {
    return executable
  }
  throw new Error(`[test-with-playwright] failed to locate Electron executable in ${directory}`)
}
