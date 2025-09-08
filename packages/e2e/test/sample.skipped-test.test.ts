import { test, expect } from '@jest/globals'
import { runFixture } from './_runFixture.ts'

test.skip('sample.skipped-test', async (): Promise<void> => {
  const { stdout, exitCode } = await runFixture('sample.skipped-test')
  expect(exitCode).toBe(0)
  expect(stdout).toMatch(/1 test skipped in \d+(\.\d+?)ms/)
  // expect(stderr).toBe('')
})
