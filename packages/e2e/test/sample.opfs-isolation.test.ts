import { expect, test } from '@jest/globals'
import { runFixture } from '../src/_runFixture.ts'

const browser = process.env['TEST_WITH_PLAYWRIGHT_BROWSER'] || 'chromium'

if (browser === 'chromium') {
  test('shared Chromium runs awaited OPFS teardown after a failed scenario', async () => {
    const result = await runFixture('sample.opfs-isolation')
    expect({ exitCode: result.exitCode, stderr: result.stderr, stdout: result.stdout }).toMatchObject({ exitCode: 1 })
    expect(result.stdout).toContain('1 test passed')
    expect(result.stdout).toContain('1 test failed')
    expect(result.stdout + result.stderr).toContain('intentional assertion failure before OPFS teardown')
  })
} else {
  test.todo('Chromium shared-profile OPFS cleanup')
}
