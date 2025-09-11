import * as GetPossibleServerPaths from '../GetPossibleServerPaths/GetPossibleServerPaths.ts'

export const getServerPath = async (serverPath?: string): Promise<string> => {
  if (serverPath) {
    return serverPath
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
