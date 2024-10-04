import { runFixture } from './_runFixture.js'

test.skip('sample.skipped-test', async () => {
  const { stdout, exitCode } = await runFixture('sample.skipped-test')
  expect(exitCode).toBe(0)
  expect(stdout).toMatch(/1 test skipped in \d+(\.\d+?)ms/)
  // expect(stderr).toBe('')
})
