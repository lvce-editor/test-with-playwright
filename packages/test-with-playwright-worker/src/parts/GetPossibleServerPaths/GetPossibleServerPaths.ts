import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

export const getPossibleServerPaths = (cwd: string): readonly string[] => {
  const toTry: readonly string[] = [
    '@lvce-editor/server',
    pathToFileURL(join(cwd, '..', 'server', 'node_modules', '@lvce-editor', 'server', 'index.js')).toString(),
    pathToFileURL(join(cwd, '..', 'build', 'node_modules', '@lvce-editor', 'server', 'index.js')).toString(),
    pathToFileURL(
      join(cwd, '..', '..', '..', 'packages', 'server', 'node_modules', '@lvce-editor', 'server', 'index.js'),
    ).toString(),
  ]
  return toTry
}
