export interface ElectronAsset {
  readonly archiveType: 'deb' | 'dmg' | 'exe'
  readonly assetName: string
}

const getLinuxArch = (arch: string): string => {
  switch (arch) {
    case 'arm':
      return 'armhf'
    case 'arm64':
      return 'arm64'
    case 'x64':
      return 'amd64'
    default:
      throw new Error(`[test-with-playwright] unsupported electron platform: linux/${arch}`)
  }
}

const getWindowsArch = (arch: string): string => {
  switch (arch) {
    case 'arm64':
      return 'arm64'
    case 'x64':
      return 'x64'
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
    case 'darwin':
      if (arch !== 'arm64') {
        throw new Error(`[test-with-playwright] unsupported electron platform: darwin/${arch}`)
      }
      return {
        archiveType: 'dmg',
        assetName: `lvce-${version}_arm64.dmg`,
      }
    case 'linux':
      return {
        archiveType: 'deb',
        assetName: `lvce-${version}_${getLinuxArch(arch)}.deb`,
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
