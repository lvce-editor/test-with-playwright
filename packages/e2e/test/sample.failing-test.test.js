import { runFixture } from './_runFixture.js'

test('sample.failing-test', async () => {
  const { stdout, stderr, exitCode } = await runFixture('sample.failing-test')
  expect(exitCode).toBe(0)
  expect(stdout).toMatch(/1 test failed in \d+(\.\d+?)ms/)
  expect(exitCode).toBe(1)
})
