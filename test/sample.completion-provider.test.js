import { runFixture } from './_runFixture.js'

test('sample.completion-provider', async () => {
  const { stdout, stderr, exitCode } = await runFixture(
    'sample.completion-provider'
  )
  expect(exitCode).toBe(0)
  expect(stdout).toMatch(/1 tests passed in \d+(\.\d+)?ms/)
  // expect(stderr).toBe('')
})
