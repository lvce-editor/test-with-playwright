import { test, expect } from '@jest/globals'
import * as ParseCliArgs from '../src/parts/ParseCliArgs/ParseCliArgs.ts'

test('parseCliArgs parses electron runtime flags', () => {
  const result = ParseCliArgs.parseCliArgs([
    '--runtime=electron',
    '--electron-path=/tmp/electron',
    '--electron-cwd=/tmp/app',
    '--electron-entry=.',
    '--electron-arg=--wait',
    '--electron-arg=--inspect',
    '--electron-env=DEV=1',
    '--electron-env=LVCE_ROOT=/tmp/app',
  ])

  expect(result).toEqual({
    electronArgs: ['--wait', '--inspect'],
    electronCwd: '/tmp/app',
    electronEntry: '.',
    electronEnv: ['DEV=1', 'LVCE_ROOT=/tmp/app'],
    electronPath: '/tmp/electron',
    runtime: 'electron',
  })
})

test('parseCliArgs defaults electron arrays to single item arrays', () => {
  const result = ParseCliArgs.parseCliArgs(['--electron-arg=--wait', '--electron-env=DEV=1'])

  expect(result).toEqual({
    electronArgs: ['--wait'],
    electronEnv: ['DEV=1'],
  })
})
