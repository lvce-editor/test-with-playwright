import { expect, test } from '@jest/globals'
import * as ParseCliArgs from '../src/parts/ParseCliArgs/ParseCliArgs.ts'

test('parseCliArgs parses electron runtime flags', () => {
  const result = ParseCliArgs.parseCliArgs([
    '--runtime=electron',
    '--electron-path=/tmp/lvce',
    '--electron-version=v0.84.0',
    '--electron-cache-dir=/tmp/cache',
    '--electron-arg=--user-data-dir=/tmp/user-data',
    '--electron-arg=--disable-gpu',
    '--electron-env=DEV=1',
    '--electron-env=LVCE_TEST=1',
  ])

  expect(result).toEqual({
    electronArgs: ['--user-data-dir=/tmp/user-data', '--disable-gpu'],
    electronCacheDir: '/tmp/cache',
    electronEnv: ['DEV=1', 'LVCE_TEST=1'],
    electronPath: '/tmp/lvce',
    electronVersion: 'v0.84.0',
    runtime: 'electron',
  })
})

test('parseCliArgs converts repeatable electron options to arrays', () => {
  const result = ParseCliArgs.parseCliArgs(['--electron-arg=--disable-gpu', '--electron-env=DEV=1'])

  expect(result).toEqual({
    electronArgs: ['--disable-gpu'],
    electronEnv: ['DEV=1'],
  })
})

test('parseCliArgs reads electron shorthand', () => {
  const result = ParseCliArgs.parseCliArgs(['--electron'])

  expect(result).toEqual({
    runtime: 'electron',
  })
})

test('parseCliArgs reads reuse page flag', () => {
  const result = ParseCliArgs.parseCliArgs(['--reuse-page'])

  expect(result).toEqual({
    reusePage: true,
  })
})

test('parseCliArgs reads timeout', () => {
  const result = ParseCliArgs.parseCliArgs(['--timeout=600000'])

  expect(result).toEqual({
    timeout: 600_000,
  })
})

test('parseCliArgs rejects invalid timeout', () => {
  expect(() => ParseCliArgs.parseCliArgs(['--timeout=invalid'])).toThrow(
    new TypeError('expected --timeout to be a positive number'),
  )
})
