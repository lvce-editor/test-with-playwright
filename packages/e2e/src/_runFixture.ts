import { fork } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { waitForChildProcessToExit } from './waitForChildProcessToExit.ts'

const __dirname = import.meta.dirname

const root = join(__dirname, '..', '..', '..')

const serverPath = join(root, 'packages', 'server', 'node_modules', '@lvce-editor', 'server', 'src', 'server.js')

interface FixtureResult {
  stdout: string
  stderr: string
  exitCode: number | null
}

export const runFixture = async (name: string): Promise<FixtureResult> => {
  const binaryPath = join(root, 'packages', 'test-with-playwright', 'bin', 'test-with-playwright.js')
  const cwd = join(root, 'packages', 'e2e', 'fixtures', name, 'e2e')
  if (!existsSync(cwd)) {
    throw new Error('cwd does not exist')
  }
  const child = fork(binaryPath, ['--headless', '--server-path', serverPath], {
    cwd,
    stdio: 'pipe',
    env: {
      ...process.env,
      ONLY_EXTENSION: '../extension',
      TEST_PATH: '.',
    },
  })
  const { code, stdout, stderr } = await waitForChildProcessToExit(child)
  return {
    stdout,
    stderr,
    exitCode: code,
  }
}
