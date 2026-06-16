export interface ElectronAsset {
  readonly assetName: string
  readonly archiveType: 'deb' | 'dmg' | 'exe'
}

const getLinuxArch = (arch: string): string => {
  switch (arch) {
    case 'x64':
      return 'amd64'
    case 'arm64':
      return 'arm64'
    case 'arm':
      return 'armhf'
    default:
      throw new Error(`[test-with-playwright] unsupported electron platform: linux/${arch}`)
  }
}

const getWindowsArch = (arch: string): string => {
  switch (arch) {
    case 'x64':
      return 'x64'
    case 'arm64':
      return 'arm64'
    default:
      throw new Error(`[test-with-playwright] unsupported electron platform: win32/${arch}`)
  }
}

export const resolveElectronAsset = ({
  arch = process.arch,
  platform = process.platform,
  version,
}: {
  readonly arch?: string
  readonly platform?: string
  readonly version: string
}): ElectronAsset => {
  switch (platform) {
    case 'linux':
      return {
        archiveType: 'deb',
        assetName: `lvce-${version}_${getLinuxArch(arch)}.deb`,
      }
    case 'darwin':
      if (arch !== 'arm64') {
        throw new Error(`[test-with-playwright] unsupported electron platform: darwin/${arch}`)
      }
      return {
        archiveType: 'dmg',
        assetName: `lvce-${version}_arm64.dmg`,
      }
    case 'win32':
      return {
        archiveType: 'exe',
        assetName: `Lvce-Setup-${version}-${getWindowsArch(arch)}.exe`,
      }
    default:
      throw new Error(`[test-with-playwright] unsupported electron platform: ${platform}/${arch}`)
  }
}
