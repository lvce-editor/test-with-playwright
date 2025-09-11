import { pathToFileURL } from 'node:url'
import * as GetPossibleServerPaths from '../GetPossibleServerPaths/GetPossibleServerPaths.ts'

export const getServerPath = async (serverPath?: string): Promise<string> => {
  console.log({ serverPath })
  if (serverPath) {
    return pathToFileURL(serverPath).toString()
  }
  const toTry = GetPossibleServerPaths.getPossibleServerPaths()
  // @ts-ignore
  for (const path of toTry) {
    try {
      const { serverPath } = await import(path)
      return serverPath
    } catch {
      // ignore
    }
  }
  throw new Error(`[test-with-playwright] server path not found`)
}
