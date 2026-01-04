import { test, expect } from '@jest/globals'
import { runFixture } from '../src/_runFixture.ts'

test('sample.failing-test', async (): Promise<void> => {
  const { exitCode, stdout } = await runFixture('sample.failing-test')
  expect(exitCode).toBe(1)
  expect(stdout).toMatch(/1 test failed in \d+ms/)
})
