import { cp } from 'node:fs/promises'
import { join } from 'node:path'
import { root } from './root.js'

export const generateApiTypes = async () => {
  const typesPath = join(root, 'packages', 'build', 'node_modules', '@lvce-editor', 'test-worker', 'dist', 'api.d.ts')
  const outPath = join(root, '.tmp', 'test-with-playwright', 'api.d.ts')
  await cp(typesPath, outPath)
}
