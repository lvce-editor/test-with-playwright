import { expect, test } from '@jest/globals'
import * as ResolveElectronAsset from '../src/parts/ResolveElectronAsset/ResolveElectronAsset.ts'

test('resolveElectronAsset maps linux x64 to deb asset', () => {
  expect(ResolveElectronAsset.resolveElectronAsset({ arch: 'x64', platform: 'linux', version: 'v0.84.0' })).toEqual({
    archiveType: 'deb',
    assetName: 'lvce-v0.84.0_amd64.deb',
  })
})

test('resolveElectronAsset maps linux arm64 to deb asset', () => {
  expect(ResolveElectronAsset.resolveElectronAsset({ arch: 'arm64', platform: 'linux', version: 'v0.84.0' })).toEqual({
    archiveType: 'deb',
    assetName: 'lvce-v0.84.0_arm64.deb',
  })
})

test('resolveElectronAsset maps macos arm64 to dmg asset', () => {
  expect(ResolveElectronAsset.resolveElectronAsset({ arch: 'arm64', platform: 'darwin', version: 'v0.84.0' })).toEqual({
    archiveType: 'dmg',
    assetName: 'lvce-v0.84.0_arm64.dmg',
  })
})

test('resolveElectronAsset maps windows x64 to installer asset', () => {
  expect(ResolveElectronAsset.resolveElectronAsset({ arch: 'x64', platform: 'win32', version: 'v0.84.0' })).toEqual({
    archiveType: 'exe',
    assetName: 'Lvce-Setup-v0.84.0-x64.exe',
  })
})

test('resolveElectronAsset maps windows arm64 to installer asset', () => {
  expect(ResolveElectronAsset.resolveElectronAsset({ arch: 'arm64', platform: 'win32', version: 'v0.84.0' })).toEqual({
    archiveType: 'exe',
    assetName: 'Lvce-Setup-v0.84.0-arm64.exe',
  })
})

test('resolveElectronAsset rejects unsupported macos arch', () => {
  expect(() =>
    ResolveElectronAsset.resolveElectronAsset({ arch: 'x64', platform: 'darwin', version: 'v0.84.0' }),
  ).toThrow(new Error('[test-with-playwright] unsupported electron platform: darwin/x64'))
})
