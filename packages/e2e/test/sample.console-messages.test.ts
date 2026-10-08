import { expect, test } from '@jest/globals'
import { runFixture } from '../src/_runFixture.ts'

const twoTestsPassedRegex = /2 tests passed in \d+(\.\d+)?ms/
const oneTestFailedRegex = /1 test failed in \d+(\.\d+)?ms/
const oneTestPassedOneFailedRegex = /1 test passed, 1 test failed in \d+(\.\d+)?ms/

test('console messages do not fail by default and do not leak between tests', async () => {
  const result = await runFixture('sample.console-messages')

  expect(result.exitCode).toBe(0)
  expect(result.stdout).toMatch(twoTestsPassedRegex)
})

test('failOnConsoleMessages reports warnings, errors, and uncaught page errors', async () => {
  const result = await runFixture('sample.console-messages', [
    '--fail-on-console-messages',
    '--filter=console.messages',
  ])
  const output = result.stdout + result.stderr

  expect(result.exitCode).toBe(1)
  expect(output).toContain('console warning: fixture warning')
  expect(output).toContain('console error: fixture error')
  expect(output).toContain('uncaught page error:')
  expect(output).toContain('fixture uncaught page error')
  expect(output).toMatch(oneTestFailedRegex)
})

test('failOnConsoleMessages reports reused-page messages without changing scenario results', async () => {
  const result = await runFixture('sample.console-messages', [
    '--fail-on-console-messages',
    '--reuse-page',
    '--filter=console.messages',
  ])
  const output = result.stdout + result.stderr

  expect(result.exitCode).toBe(1)
  expect(output).toContain('console warning: fixture warning')
  expect(output).toContain('console error: fixture error')
  expect(output).toContain('uncaught page error:')
  expect(output).toContain('fixture uncaught page error')
  expect(output).toMatch(oneTestPassedOneFailedRegex)
})
