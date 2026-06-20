import { expect, test } from '@jest/globals'
import * as GetTestUrl from '../src/parts/GetTestUrl/GetTestUrl.ts'

test('getTestUrl maps javascript tests to html pages', () => {
  expect(
    GetTestUrl.getTestUrl({
      port: 3001,
      test: 'electron.typed-smoke.js',
    }),
  ).toBe('http://localhost:3001/tests/electron.typed-smoke.html')
})

test('getTestUrl maps typescript tests to html pages', () => {
  expect(
    GetTestUrl.getTestUrl({
      port: 3001,
      test: 'electron.typed-smoke.ts',
    }),
  ).toBe('http://localhost:3001/tests/electron.typed-smoke.html')
})

test('getTestUrl preserves traceFocus option', () => {
  expect(
    GetTestUrl.getTestUrl({
      port: 4567,
      test: 'sample.hello-world.ts',
      traceFocus: true,
    }),
  ).toBe('http://localhost:4567/tests/sample.hello-world.html?traceFocus=true')
})

test('getTestUrl supports custom origins', () => {
  expect(
    GetTestUrl.getTestUrl({
      origin: 'lvce://-',
      port: 0,
      test: 'electron.typed-smoke.ts',
    }),
  ).toBe('lvce://-/tests/electron.typed-smoke.html')
})
