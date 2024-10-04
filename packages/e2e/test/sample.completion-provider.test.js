import { runFixture } from './_runFixture.js'

const timeout = 30_000

test(
  'sample.completion-provider',
  async () => {
    const { stdout, exitCode } = await runFixture('sample.completion-provider')
    expect(exitCode).toBe(0)
    expect(stdout).toMatch(/1 test passed in \d+(\.\d+)?ms/)
    // expect(stderr).toBe('')
  },
  timeout,
)
