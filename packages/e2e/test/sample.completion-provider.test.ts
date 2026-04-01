import { test, expect } from '@jest/globals'
import { runFixture } from '../src/_runFixture.ts'

const testPassedRegex = /1 test passed in \d+(\.\d+)?ms/

test('sample.completion-provider', async (): Promise<void> => {
  const { exitCode, stdout } = await runFixture('sample.completion-provider')
  expect(exitCode).toBe(0)
  expect(stdout).toMatch(testPassedRegex)
  // expect(stderr).toBe('')
})
