import { test, expect } from '@jest/globals'
import * as GetFinalResultMessage from '../src/parts/GetFinalResultMessage/GetFinalResultMessage.ts'

test('1 failing test', () => {
  const passed = 0
  const skipped = 0
  const failed = 1
  const duration = 0
  expect(GetFinalResultMessage.getFinalResultMessage(passed, skipped, failed, duration)).toBe(`1 test failed in 0ms`)
})

test('1 passed 1 skipped 1 failed test', () => {
  const passed = 1
  const skipped = 1
  const failed = 1
  const duration = 0
  expect(GetFinalResultMessage.getFinalResultMessage(passed, skipped, failed, duration)).toBe(
    `1 test passed, 1 test skipped, 1 test failed in 0ms`,
  )
})

test('multiple passed and failed tests', () => {
  const passed = 2
  const skipped = 0
  const failed = 3
  const duration = 0
  expect(GetFinalResultMessage.getFinalResultMessage(passed, skipped, failed, duration)).toBe(
    `2 tests passed, 3 tests failed in 0ms`,
  )
})
