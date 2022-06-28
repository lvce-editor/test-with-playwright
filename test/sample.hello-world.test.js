import { runFixture } from './_runFixture.js'

test('sample.hello-world', async () => {
  const { stdout, stderr, exitCode } = await runFixture('sample.hello-world')
  expect(exitCode).toBe(0)
  expect(stdout).toMatch(/1 tests passed in \d+(\.\d+)?ms/)
  // expect(stderr).toBe('')
})
