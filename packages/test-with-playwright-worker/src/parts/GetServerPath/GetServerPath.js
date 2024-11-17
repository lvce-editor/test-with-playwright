import * as GetPossibleServerPaths from '../GetPossibleServerPaths/GetPossibleServerPaths.js'

export const getServerPath = async () => {
  const toTry = GetPossibleServerPaths.getPossibleServerPaths()
  for (const path of toTry) {
    try {
      const { serverPath } = await import(path)
      return serverPath
    } catch (error) {
      // ignore
    }
  }
  throw new Error(`[test-with-playwright] server path not found`)
}
