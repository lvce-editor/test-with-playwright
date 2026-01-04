import { test, expect } from '@jest/globals'
import { runFixture } from '../src/_runFixture.ts'

test('sample.hello-world', async (): Promise<void> => {
  const { exitCode, stdout } = await runFixture('sample.hello-world')
  expect(exitCode).toBe(0)
  expect(stdout).toMatch(/1 test passed in \d+(\.\d+)?ms/)
  // expect(stderr).toBe('')
})
