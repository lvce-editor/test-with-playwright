import { test, expect } from '@jest/globals'
import { runFixture } from '../src/_runFixture.ts'

test('sample.skipped-test', async (): Promise<void> => {
  const { exitCode, stdout } = await runFixture('sample.skipped-test')
  expect(exitCode).toBe(0)
  expect(stdout).toMatch(/1 test skipped in \d+ms/)
  // expect(stderr).toBe('')
})
