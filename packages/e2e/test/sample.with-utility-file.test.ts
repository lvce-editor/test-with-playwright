import { test, expect } from '@jest/globals'
import { runFixture } from '../src/_runFixture.ts'

test('sample.with-utility-file', async (): Promise<void> => {
  const { stdout, exitCode } = await runFixture('sample.with-utility-file')
  expect(exitCode).toBe(0)
  expect(stdout).toMatch(/1 test passed in \d+(\.\d+)?ms/)
  // expect(stderr).toBe('')
})
