import { runFixture } from './_runFixture.js'

test('sample.skipped-test', async () => {
  const { stdout, stderr, exitCode } = await runFixture('sample.skipped-test')
  expect(exitCode).toBe(0)
  expect(stdout).toMatch(/0 tests passed, 1 tests skipped in \d+(\.\d+?)ms/)
  // expect(stderr).toBe('')
})
