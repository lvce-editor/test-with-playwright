import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { root } from './root.ts'

export const generateApiTypes = async (): Promise<void> => {
  const configTypes = await readFile(
    join(root, 'packages', 'test-with-playwright', 'src', 'parts', 'E2eConfig', 'E2eConfig.ts'),
    'utf8',
  )
  const typesContent = `export * from '@lvce-editor/test-worker'
${configTypes}
export declare const defineConfig: (config: E2eConfig) => E2eConfig
`
  const outPath = join(root, 'dist', 'test-with-playwright', 'api.d.ts')
  await writeFile(outPath, typesContent)
}
