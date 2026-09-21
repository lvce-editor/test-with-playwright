import { expect, test } from '@jest/globals'
import * as StartServer from '../src/parts/StartServer/StartServer.ts'

test('getServerArgs passes repeated link arguments as separate values', () => {
  expect(StartServer.getServerArgs(['/workspace/extension', '/workspace/linked extension'])).toEqual([
    '--link',
    '/workspace/extension',
    '--link',
    '/workspace/linked extension',
  ])
})

test('getServerArgs preserves existing behavior when links are omitted or empty', () => {
  expect(StartServer.getServerArgs(undefined)).toEqual([])
  expect(StartServer.getServerArgs([])).toEqual([])
})
