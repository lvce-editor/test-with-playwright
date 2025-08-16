import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { root } from './root.js'

export const generateApiTypes = async () => {
  const typesContent = `export * from '@lvce-editor/test-worker'`
  const outPath = join(root, 'dist', 'test-with-playwright', 'api.d.ts')
  await writeFile(outPath, typesContent)
}
