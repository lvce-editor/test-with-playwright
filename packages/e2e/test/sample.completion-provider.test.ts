import { test, expect } from '@jest/globals'
import { runFixture } from '../src/_runFixture.ts'

const testPassedRegex = /1 test passed in \d+(\.\d+)?ms/

// eslint-disable-next-line jest/no-disabled-tests -- fixture is intentionally parked but kept runnable
test.skip('sample.completion-provider', async (): Promise<void> => {
  const { exitCode, stdout } = await runFixture('sample.completion-provider')
  expect(exitCode).toBe(0)
  expect(stdout).toMatch(testPassedRegex)
  // expect(stderr).toBe('')
})
