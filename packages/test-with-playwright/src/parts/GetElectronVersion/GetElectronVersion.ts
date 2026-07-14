import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, parse, resolve } from 'node:path'

const serverPackageName = '@lvce-editor/server'

const normalizeVersion = (version: string): string => {
  return version.startsWith('v') ? version : `v${version}`
}

const readServerVersion = async (path: string): Promise<string | undefined> => {
  try {
    const content = await readFile(path, 'utf8')
    const packageJson = JSON.parse(content)
    if (packageJson.name === serverPackageName && typeof packageJson.version === 'string') {
      return normalizeVersion(packageJson.version)
    }
  } catch {
    // Try the next possible package location.
  }
  return undefined
}

const findServerVersionFromPath = async (path: string): Promise<string | undefined> => {
  let current = resolve(path)
  if (!current.endsWith('package.json')) {
    current = dirname(current)
  }
  const { root } = parse(current)
  while (current !== root) {
    const version = await readServerVersion(join(current, 'package.json'))
    if (version) {
      return version
    }
    current = dirname(current)
  }
  return undefined
}

const resolveServerEntryPoint = (cwd: string): string | undefined => {
  try {
    const require = createRequire(join(cwd, 'package.json'))
    return require.resolve(serverPackageName)
  } catch {
    return undefined
  }
}

const getPossibleServerPaths = (cwd: string, serverPath: string | undefined): readonly string[] => {
  const resolvedServerEntryPoint = resolveServerEntryPoint(cwd)
  return [
    ...(serverPath ? [resolve(cwd, serverPath)] : []),
    ...(resolvedServerEntryPoint ? [resolvedServerEntryPoint] : []),
    join(cwd, 'node_modules', '@lvce-editor', 'server', 'package.json'),
    join(cwd, '..', 'server', 'node_modules', '@lvce-editor', 'server', 'package.json'),
    join(cwd, '..', 'build', 'node_modules', '@lvce-editor', 'server', 'package.json'),
  ]
}

export const getElectronVersion = async ({
  cwd,
  serverPath,
}: {
  readonly cwd: string
  readonly serverPath?: string
}): Promise<string> => {
  for (const possiblePath of getPossibleServerPaths(cwd, serverPath)) {
    const version = possiblePath.endsWith('package.json')
      ? await readServerVersion(possiblePath)
      : await findServerVersionFromPath(possiblePath)
    if (version) {
      return version
    }
  }
  throw new Error(
    '[test-with-playwright] Electron version could not be inferred from @lvce-editor/server; use --electron-version or --electron-path',
  )
}
