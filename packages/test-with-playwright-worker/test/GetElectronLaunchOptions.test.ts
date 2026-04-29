import { test, expect } from '@jest/globals'
import * as GetElectronLaunchOptions from '../src/parts/GetElectronLaunchOptions/GetElectronLaunchOptions.ts'

test('getElectronLaunchOptions maps runtime config to playwright launch options', () => {
  const result = GetElectronLaunchOptions.getElectronLaunchOptions({
    args: ['--wait', '--trace'],
    cwd: '/workspace/app',
    entry: '.',
    env: {
      DEV: '1',
    },
    executablePath: '/workspace/app/node_modules/electron/dist/electron',
    type: 'electron',
  })

  expect(result).toEqual({
    args: ['.', '--wait', '--trace'],
    cwd: '/workspace/app',
    env: {
      DEV: '1',
    },
    executablePath: '/workspace/app/node_modules/electron/dist/electron',
  })
})