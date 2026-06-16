import { expect, test } from '@jest/globals'
import { resolve } from 'node:path'
import * as GetRuntimeOptions from '../src/parts/GetRuntimeOptions/GetRuntimeOptions.ts'

test('getRuntimeOptions returns browser runtime by default', async () => {
  const result = await GetRuntimeOptions.getRuntimeOptions({
    cwd: '/workspace/e2e',
    serverPath: '/workspace/server.js',
  })

  expect(result).toEqual({
    serverPath: '/workspace/server.js',
    type: 'browser',
  })
})

test('getRuntimeOptions returns electron runtime with path override', async () => {
  const result = await GetRuntimeOptions.getRuntimeOptions({
    cwd: '/workspace/e2e',
    electronArgs: ['--disable-gpu'],
    electronEnv: ['DEV=1', 'EMPTY'],
    electronPath: './Lvce',
    runtime: 'electron',
  })

  expect(result).toEqual({
    args: ['--disable-gpu'],
    env: {
      DEV: '1',
      EMPTY: '',
    },
    executablePath: resolve('/workspace/e2e/Lvce'),
    type: 'electron',
  })
})

test('getRuntimeOptions requires electron version when no path is provided', async () => {
  await expect(
    GetRuntimeOptions.getRuntimeOptions({
      cwd: '/workspace/e2e',
      runtime: 'electron',
    }),
  ).rejects.toThrow(
    new Error(
      '[test-with-playwright] --electron-version is required when --runtime=electron and --electron-path is not provided',
    ),
  )
})
