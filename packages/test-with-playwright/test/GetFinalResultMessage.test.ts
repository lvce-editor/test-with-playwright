import { test, expect } from '@jest/globals'
import * as GetFinalResultMessage from '../src/parts/GetFinalResultMessage/GetFinalResultMessage.ts'

test('1 failing test', () => {
  const passed = 0
  const skipped = 0
  const failed = 1
  const duration = 0
  expect(GetFinalResultMessage.getFinalResultMessage(passed, skipped, failed, duration)).toBe(`1 test failed in 0ms`)
})
