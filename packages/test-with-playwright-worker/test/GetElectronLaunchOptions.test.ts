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

test('getElectronLaunchOptions omits undefined process environment values', () => {
  const originalEnv = process.env
  process.env = {
    DEFINED: 'value',
    OMITTED: undefined,
  }
  try {
    const result = GetElectronLaunchOptions.getElectronLaunchOptions({
      args: [],
      env: {},
      executablePath: '/workspace/lvce',
      type: 'electron',
    })

    expect(result.env).toEqual({
      DEFINED: 'value',
    })
  } finally {
    process.env = originalEnv
  }
})
