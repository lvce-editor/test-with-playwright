import { test, expect } from '@jest/globals'
import * as GetRuntimeOptions from '../src/parts/GetRuntimeOptions/GetRuntimeOptions.ts'

test('getRuntimeOptions returns browser runtime by default', () => {
  const result = GetRuntimeOptions.getRuntimeOptions({
    cwd: '/workspace/e2e',
    serverPath: '/workspace/server.js',
  })

  expect(result).toEqual({
    serverPath: '/workspace/server.js',
    type: 'browser',
  })
})

test('getRuntimeOptions returns electron runtime with defaults', () => {
  const result = GetRuntimeOptions.getRuntimeOptions({
    cwd: '/workspace/e2e',
    electronArgs: ['--wait'],
    electronEnv: ['DEV=1', 'LVCE_ROOT=/workspace/app'],
    runtime: 'electron',
  })

  expect(result).toEqual({
    args: ['--wait'],
    cwd: '/workspace/e2e',
    entry: '.',
    env: {
      DEV: '1',
      LVCE_ROOT: '/workspace/app',
    },
    executablePath: undefined,
    type: 'electron',
  })
})