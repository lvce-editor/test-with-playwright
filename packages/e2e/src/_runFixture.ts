import { fork } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { root } from './root.ts'
import { waitForChildProcessToExit } from './waitForChildProcessToExit.ts'

const serverPath = join(root, 'packages', 'server', 'node_modules', '@lvce-editor', 'server', 'src', 'server.js')

interface FixtureResult {
  exitCode: number | null
  stderr: string
  stdout: string
}

export const runFixture = async (name: string): Promise<FixtureResult> => {
  const binaryPath = join(root, 'packages', 'test-with-playwright', 'bin', 'test-with-playwright.js')
  const cwd = join(root, 'packages', 'e2e', 'fixtures', name, 'e2e')
  if (!existsSync(cwd)) {
    throw new Error('cwd does not exist')
  }
  const child = fork(binaryPath, ['--headless', '--server-path', serverPath], {
    cwd,
    env: {
      ...process.env,
      ONLY_EXTENSION: '../extension',
      TEST_PATH: '.',
    },
    stdio: 'pipe',
  })
  const { code, stderr, stdout } = await waitForChildProcessToExit(child)
  return {
    exitCode: code,
    stderr,
    stdout,
  }
}
