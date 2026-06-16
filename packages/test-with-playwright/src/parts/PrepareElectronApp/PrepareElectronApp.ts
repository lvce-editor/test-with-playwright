import { existsSync } from 'node:fs'
import { chmod, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import * as DownloadFile from '../DownloadFile/DownloadFile.ts'
import * as ExecFile from '../ExecFile/ExecFile.ts'
import * as FindElectronExecutable from '../FindElectronExecutable/FindElectronExecutable.ts'
import * as ResolveElectronAsset from '../ResolveElectronAsset/ResolveElectronAsset.ts'

const getDownloadUrl = ({ assetName, version }: { readonly assetName: string; readonly version: string }): string => {
  return `https://github.com/lvce-editor/lvce-editor/releases/download/${version}/${assetName}`
}

const prepareLinux = async ({
  assetPath,
  cachePath,
}: {
  readonly assetPath: string
  readonly cachePath: string
}): Promise<void> => {
  await ExecFile.execFile({
    args: ['-x', assetPath, cachePath],
    command: 'dpkg-deb',
  })
}

const prepareMacos = async ({
  assetPath,
  cachePath,
}: {
  readonly assetPath: string
  readonly cachePath: string
}): Promise<void> => {
  const mountRoot = await mkdtemp(join(tmpdir(), 'test-with-playwright-dmg-'))
  try {
    await ExecFile.execFile({
      args: ['attach', assetPath, '-mountpoint', mountRoot, '-nobrowse', '-quiet'],
      command: 'hdiutil',
    })
    const entries = await readdir(mountRoot)
    const appName = entries.find((entry) => entry.endsWith('.app'))
    if (!appName) {
      throw new Error(`[test-with-playwright] failed to locate .app in ${assetPath}`)
    }
    await ExecFile.execFile({
      args: ['-R', join(mountRoot, appName), join(cachePath, appName)],
      command: 'cp',
    })
  } finally {
    await ExecFile.execFile({
      args: ['detach', mountRoot, '-quiet'],
      command: 'hdiutil',
    }).catch(() => undefined)
    await rm(mountRoot, { force: true, recursive: true })
  }
}

const prepareWindows = async ({
  assetPath,
  cachePath,
}: {
  readonly assetPath: string
  readonly cachePath: string
}): Promise<void> => {
  await ExecFile.execFile({
    args: ['/S', `/D=${cachePath}`],
    command: assetPath,
  })
}

const prepareArchive = async ({
  archiveType,
  assetPath,
  cachePath,
}: {
  readonly archiveType: ResolveElectronAsset.ElectronAsset['archiveType']
  readonly assetPath: string
  readonly cachePath: string
}): Promise<void> => {
  await rm(cachePath, { force: true, recursive: true })
  await mkdir(cachePath, { recursive: true })
  switch (archiveType) {
    case 'deb':
      await prepareLinux({ assetPath, cachePath })
      break
    case 'dmg':
      await prepareMacos({ assetPath, cachePath })
      break
    case 'exe':
      await prepareWindows({ assetPath, cachePath })
      break
    default:
      throw new Error(`[test-with-playwright] unsupported Electron archive type: ${archiveType}`)
  }
}

export const prepareElectronApp = async ({
  cacheDir,
  electronPath,
  version,
}: {
  readonly cacheDir: string
  readonly electronPath?: string
  readonly version?: string
}): Promise<string> => {
  if (electronPath) {
    return resolve(electronPath)
  }
  if (!version) {
    throw new Error(
      '[test-with-playwright] --electron-version is required when --runtime=electron and --electron-path is not provided',
    )
  }
  const { archiveType, assetName } = ResolveElectronAsset.resolveElectronAsset({ version })
  const cachePath = resolve(cacheDir, version, process.platform, process.arch)
  const downloadsPath = join(cachePath, 'downloads')
  const appPath = join(cachePath, 'app')
  const executableMarkerPath = join(cachePath, 'executable-path.txt')
  if (existsSync(executableMarkerPath)) {
    const cachedExecutablePathContent = await readFile(executableMarkerPath, 'utf8')
    const cachedExecutablePath = cachedExecutablePathContent.trim()
    if (existsSync(cachedExecutablePath)) {
      return cachedExecutablePath
    }
  }
  const assetPath = join(downloadsPath, basename(assetName))
  await mkdir(downloadsPath, { recursive: true })
  if (!existsSync(assetPath)) {
    await DownloadFile.downloadFile({
      to: assetPath,
      url: getDownloadUrl({ assetName, version }),
    })
  }
  await prepareArchive({ archiveType, assetPath, cachePath: appPath })
  const executablePath = await FindElectronExecutable.findElectronExecutable({
    directory: appPath,
    platform: process.platform,
  })
  if (process.platform !== 'win32') {
    await chmod(executablePath, 0o755)
  }
  await writeFile(executableMarkerPath, executablePath)
  return executablePath
}
