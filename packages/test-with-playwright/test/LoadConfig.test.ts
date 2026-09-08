import { afterEach, expect, test } from '@jest/globals'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as LoadConfig from '../src/parts/LoadConfig/LoadConfig.ts'

const directories: string[] = []

const createDirectory = async (): Promise<string> => {
  const directory = await mkdtemp(join(tmpdir(), 'e2e-config-'))
  directories.push(directory)
  await writeFile(join(directory, 'package.json'), '{"type":"module"}')
  return directory
}

afterEach(async () => {
  const current = [...directories]
  directories.length = 0
  await Promise.all(current.map((directory) => rm(directory, { force: true, recursive: true })))
})

test('loads a default object and resolves paths relative to the config file', async () => {
  const directory = await createDirectory()
  await writeFile(
    join(directory, 'e2e.config.js'),
    "export default { testPath: './tests', onlyExtension: './extension', serverPath: './server.js', headless: false, reusePage: true }",
  )
  const child = join(directory, 'packages', 'e2e')
  await mkdir(child, { recursive: true })
  expect(await LoadConfig.loadConfig(child)).toEqual({
    headless: false,
    onlyExtension: join(directory, 'extension'),
    reusePage: true,
    serverPath: join(directory, 'server.js'),
    testPath: join(directory, 'tests'),
  })
})

test('uses the nearest config without merging parent configs', async () => {
  const directory = await createDirectory()
  const child = join(directory, 'child')
  await mkdir(child)
  await writeFile(join(directory, 'e2e.config.js'), "export default { browser: 'firefox' }")
  await writeFile(join(child, 'e2e.config.js'), 'export default { headless: true }')
  expect(await LoadConfig.loadConfig(child)).toEqual({ headless: true })
})

test('returns no options when no config exists', async () => {
  expect(await LoadConfig.loadConfig(await createDirectory())).toEqual({})
})

test.each([
  'export default null',
  'export default []',
  'export default () => ({})',
  'export const headless = true',
  'export default { headless: "true" }',
  'export default { typo: true }',
  'export default { timeout: 0 }',
  'export default { timeout: Infinity }',
  'export default { electronArgs: [1] }',
  'export default {',
  "import './missing.js'; export default {}",
])('reports the config path for invalid or broken configs: %s', async (source) => {
  const directory = await createDirectory()
  const configPath = join(directory, 'e2e.config.js')
  await writeFile(configPath, source)
  await expect(LoadConfig.loadConfig(directory)).rejects.toThrow(`failed to load ${configPath}`)
})
