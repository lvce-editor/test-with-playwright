import { expect, test } from '@jest/globals'
import * as IsTestFile from '../src/parts/IsTestFile/IsTestFile.ts'

const createDirent = (name: string, isFile = true): { isFile: () => boolean; name: string } => ({
  isFile: () => isFile,
  name,
})

test.each(['example.js', 'example.ts'])('discovers %s fixture modules', (name) => {
  expect(IsTestFile.isTestFile(createDirent(name) as any)).toBe(true)
})

test.each(['_util.js', '_util.ts', 'readme.md'])('does not discover %s as a fixture module', (name) => {
  expect(IsTestFile.isTestFile(createDirent(name) as any)).toBe(false)
})

test('does not discover directories as fixture modules', () => {
  expect(IsTestFile.isTestFile(createDirent('fixture.ts', false) as any)).toBe(false)
})
