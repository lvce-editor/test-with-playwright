import { expect, test } from '@jest/globals'
import { join } from 'node:path'
import * as GetElectronLaunchOptions from '../src/parts/GetElectronLaunchOptions/GetElectronLaunchOptions.ts'

test('getElectronLaunchOptions maps runtime config to playwright launch options', () => {
  const result = GetElectronLaunchOptions.getElectronLaunchOptions(
    {
      args: ['--disable-gpu'],
      env: {
        DEV: '1',
      },
      executablePath: '/workspace/lvce',
      type: 'electron',
    },
    '/tmp/profile',
  )

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
    const result = GetElectronLaunchOptions.getElectronLaunchOptions(
      {
        args: [],
        env: {},
        executablePath: '/workspace/lvce',
        type: 'electron',
      },
      '/tmp/profile',
    )

    expect(result.env).toEqual({
      DEFINED: 'value',
      XDG_CACHE_HOME: join('/tmp/profile', 'cache'),
      XDG_CONFIG_HOME: join('/tmp/profile', 'config'),
      XDG_DATA_HOME: join('/tmp/profile', 'data'),
      XDG_STATE_HOME: join('/tmp/profile', 'state'),
    })
  } finally {
    process.env = originalEnv
  }
})

test('isolates LVCE settings even when the parent and runtime supply real profile paths', () => {
  const originalEnv = process.env
  process.env = { ...originalEnv, ELECTRON_RUN_AS_NODE: '1', XDG_CONFIG_HOME: '/real/config' }
  try {
    const result = GetElectronLaunchOptions.getElectronLaunchOptions(
      {
        args: [],
        env: { CUSTOM: 'preserved', XDG_CONFIG_HOME: '/runtime/config', XDG_DATA_HOME: '/real/data' },
        executablePath: '/workspace/lvce',
        type: 'electron',
      },
      '/tmp/profile',
    )
    expect(result.env).toMatchObject({
      CUSTOM: 'preserved',
      XDG_CACHE_HOME: join('/tmp/profile', 'cache'),
      XDG_CONFIG_HOME: join('/tmp/profile', 'config'),
      XDG_DATA_HOME: join('/tmp/profile', 'data'),
      XDG_STATE_HOME: join('/tmp/profile', 'state'),
    })
    expect(result.env).not.toHaveProperty('ELECTRON_RUN_AS_NODE')
    expect(process.env.XDG_CONFIG_HOME).toBe('/real/config')
  } finally {
    process.env = originalEnv
  }
})
