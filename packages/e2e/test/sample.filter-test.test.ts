import { test, expect } from '@jest/globals'
import { runFixture } from '../src/_runFixture.ts'

test('sample.filter-test', async (): Promise<void> => {
  const { exitCode, stdout } = await runFixture('sample.filter-test')
  expect(exitCode).toBe(0)
  // Without filter, all 4 tests should run (sample.filter-test, filter-test-A, filter-test-B, filter-test-C)
  expect(stdout).toMatch(/4 tests passed in \d+(\.\d+)?ms/)
})

test('sample.filter-test with filter=A', async (): Promise<void> => {
  const { exitCode, stdout } = await runFixture('sample.filter-test', ['--filter=A'])
  expect(exitCode).toBe(0)
  // With filter=A, only filter-test-A and sample.filter-test (which contains 'A' in a test file name? No) should run
  // Actually, with filter=A, only filter-test-A.js should match (filter-test-A contains 'A')
  // So only 1 test should pass
  expect(stdout).toMatch(/1 test passed in \d+(\.\d+)?ms/)
})

test('sample.filter-test with filter=B', async (): Promise<void> => {
  const { exitCode, stdout } = await runFixture('sample.filter-test', ['--filter=B'])
  expect(exitCode).toBe(0)
  // With filter=B, only filter-test-B.js should match
  expect(stdout).toMatch(/1 test passed in \d+(\.\d+)?ms/)
})
