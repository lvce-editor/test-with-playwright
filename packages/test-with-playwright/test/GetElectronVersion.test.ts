import { afterEach, expect, test } from '@jest/globals'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as GetElectronVersion from '../src/parts/GetElectronVersion/GetElectronVersion.ts'

const temporaryDirectories: string[] = []

afterEach(async () => {
  const directories = [...temporaryDirectories]
  temporaryDirectories.length = 0
  await Promise.all(directories.map((directory) => rm(directory, { force: true, recursive: true })))
})

const createWorkspace = async (version: string): Promise<string> => {
  const workspace = await mkdtemp(join(tmpdir(), 'test-with-playwright-version-'))
  temporaryDirectories.push(workspace)
  const cwd = join(workspace, 'packages', 'e2e')
  const serverPackage = join(workspace, 'packages', 'server', 'node_modules', '@lvce-editor', 'server')
  await mkdir(cwd, { recursive: true })
  await mkdir(serverPackage, { recursive: true })
  await writeFile(
    join(serverPackage, 'package.json'),
    JSON.stringify({
      name: '@lvce-editor/server',
      version,
    }),
  )
  return cwd
}

test('getElectronVersion reads the sibling server package version', async () => {
  const cwd = await createWorkspace('0.89.3')

  await expect(GetElectronVersion.getElectronVersion({ cwd })).resolves.toBe('v0.89.3')
})

test('getElectronVersion accepts an explicit server entrypoint', async () => {
  const cwd = await createWorkspace('v0.89.3')
  const serverPath = join(cwd, '..', 'server', 'node_modules', '@lvce-editor', 'server', 'src', 'server.js')

  await expect(GetElectronVersion.getElectronVersion({ cwd, serverPath })).resolves.toBe('v0.89.3')
})

test('getElectronVersion reports how to override a missing server version', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'test-with-playwright-version-'))
  temporaryDirectories.push(cwd)

  await expect(GetElectronVersion.getElectronVersion({ cwd })).rejects.toThrow(
    new Error(
      '[test-with-playwright] Electron version could not be inferred from @lvce-editor/server; use --electron-version or --electron-path',
    ),
  )
})
