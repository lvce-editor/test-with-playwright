import { runFixture } from './_runFixture.js'

test('sample.hello-world', async () => {
  const { stdout, exitCode } = await runFixture('sample.hello-world')
  expect(exitCode).toBe(0)
  expect(stdout).toMatch(/1 test passed in \d+(\.\d+)?ms/)
  // expect(stderr).toBe('')
})
