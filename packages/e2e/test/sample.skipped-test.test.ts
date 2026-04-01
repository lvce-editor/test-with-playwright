import { test, expect } from '@jest/globals'
import { runFixture } from '../src/_runFixture.ts'

const testSkippedRegex = /1 test skipped in \d+ms/

test('sample.skipped-test', async (): Promise<void> => {
  const { exitCode, stdout } = await runFixture('sample.skipped-test')
  expect(exitCode).toBe(0)
  expect(stdout).toMatch(testSkippedRegex)
  // expect(stderr).toBe('')
})
