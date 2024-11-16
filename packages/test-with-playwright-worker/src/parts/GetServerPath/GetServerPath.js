import { join } from 'path'

export const getServerPath = async () => {
  const toTry = [
    '@lvce-editor/server',
    join(process.cwd(), '..', 'server', 'node_modules', '@lvce-editor', 'server', 'index.js'),
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
