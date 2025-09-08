import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { root } from './root.ts'

export const generateApiTypes = async (): Promise<void> => {
  const typesContent = `export * from '@lvce-editor/test-worker'`
  const outPath = join(root, 'dist', 'test-with-playwright', 'api.d.ts')
  await writeFile(outPath, typesContent)
}
