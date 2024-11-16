import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

export const getServerPath = async () => {
  const toTry = [
    '@lvce-editor/server',
    pathToFileURL(join(process.cwd(), '..', 'server', 'node_modules', '@lvce-editor', 'server', 'index.js')).toString(),
  ]

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
