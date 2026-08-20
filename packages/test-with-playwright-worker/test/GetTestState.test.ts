import { expect, test } from '@jest/globals'
import * as GetTestState from '../src/parts/GetTestState/GetTestState.ts'
import * as TestState from '../src/parts/TestState/TestState.ts'

test('getTestState maps failed tests and preserves the error', () => {
  expect(GetTestState.getTestState('fail', 'expected true to be false')).toEqual({
    error: 'expected true to be false',
    status: TestState.Fail,
  })
})

test('getTestState maps passed tests', () => {
  expect(GetTestState.getTestState('pass', 'ignored')).toEqual({
    error: '',
    status: TestState.Pass,
  })
})

test('getTestState maps skipped tests', () => {
  expect(GetTestState.getTestState('skip', 'ignored')).toEqual({
    error: '',
    status: TestState.Skip,
  })
})

test('getTestState rejects an unknown overlay state', () => {
  expect(() => GetTestState.getTestState('running', '')).toThrow('unexpected test state: running')
})
