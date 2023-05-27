import { runFixture } from './_runFixture.js'

test('sample.with-utility-file', async () => {
  const { stdout, stderr, exitCode } = await runFixture('sample.with-utility-file')
  expect(exitCode).toBe(0)
  expect(stdout).toMatch(/1 test passed in \d+(\.\d+)?ms/)
  // expect(stderr).toBe('')
})
