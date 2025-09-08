import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

export const getPossibleServerPaths = (): void => {
  const toTry = [
    '@lvce-editor/server',
    pathToFileURL(join(process.cwd(), '..', 'server', 'node_modules', '@lvce-editor', 'server', 'index.js')).toString(),
    pathToFileURL(join(process.cwd(), '..', 'build', 'node_modules', '@lvce-editor', 'server', 'index.js')).toString(),
    pathToFileURL(
      join(process.cwd(), '..', '..', '..', 'packages', 'server', 'node_modules', '@lvce-editor', 'server', 'index.js'),
    ).toString(),
  ]
  // @ts-ignore
  return toTry
}
