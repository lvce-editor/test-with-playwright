import { expect, test } from '@jest/globals'
import * as GetElectronLaunchOptions from '../src/parts/GetElectronLaunchOptions/GetElectronLaunchOptions.ts'

test('getElectronLaunchOptions maps runtime config to playwright launch options', () => {
  const result = GetElectronLaunchOptions.getElectronLaunchOptions({
    args: ['--disable-gpu'],
    env: {
      DEV: '1',
    },
    executablePath: '/workspace/lvce',
    type: 'electron',
  })

  expect(result).toMatchObject({
    args: ['--disable-gpu'],
    env: {
      DEV: '1',
    },
    executablePath: '/workspace/lvce',
  })
})
