import { expect, test } from '@jest/globals'
import * as GetElectronProcessArgs from '../src/parts/GetElectronProcessArgs/GetElectronProcessArgs.ts'

test('getElectronProcessArgs uses a temporary user data directory', () => {
  expect(
    GetElectronProcessArgs.getElectronProcessArgs({
      args: ['--disable-gpu'],
      platform: 'darwin',
      userDataDir: '/tmp/profile',
    }),
  ).toEqual(['--remote-debugging-port=0', '--disable-gpu', '--user-data-dir=/tmp/profile'])
})

test('getElectronProcessArgs disables the sandbox for an extracted Linux app', () => {
  expect(
    GetElectronProcessArgs.getElectronProcessArgs({
      args: [],
      platform: 'linux',
      userDataDir: '/tmp/profile',
    }),
  ).toEqual(['--remote-debugging-port=0', '--no-sandbox', '--user-data-dir=/tmp/profile'])
})
