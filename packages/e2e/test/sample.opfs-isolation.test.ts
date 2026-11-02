import { expect, test } from '@jest/globals'
import { runFixture } from '../src/_runFixture.ts'

const browser = process.env['TEST_WITH_PLAYWRIGHT_BROWSER'] || 'chromium'

if (browser === 'chromium') {
  test('default Chromium scenarios isolate OPFS files and IndexedDB handles', async () => {
    const result = await runFixture('sample.opfs-isolation')
    expect({ exitCode: result.exitCode, stderr: result.stderr, stdout: result.stdout }).toMatchObject({ exitCode: 0 })
    expect(result.stdout).toContain('2 tests passed')
  })
} else {
  test.todo('Chromium scenario profile isolation')
}
