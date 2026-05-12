import { expect, test } from '@jest/globals'
import { runFixture } from '../src/_runFixture.ts'

const testPassedRegex = /1 test passed in \d+(\.\d+)?ms/

export const skip = 1

test('sample.hello-world in firefox', async (): Promise<void> => {
  const { exitCode, stdout } = await runFixture('sample.hello-world', ['--browser=firefox'])
  expect(exitCode).toBe(0)
  expect(stdout).toMatch(testPassedRegex)
})
