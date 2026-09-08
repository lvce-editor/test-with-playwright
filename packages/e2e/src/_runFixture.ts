import { fork } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { root } from './root.ts'
import { waitForChildProcessToExit } from './waitForChildProcessToExit.ts'

const serverPath = join(root, 'node_modules', '@lvce-editor', 'server', 'src', 'server.js')

interface FixtureResult {
  exitCode: number | null
  stderr: string
  stdout: string
}

const getBrowserArgs = (): readonly string[] => {
  const browser = process.env['TEST_WITH_PLAYWRIGHT_BROWSER']
  if (!browser) {
    return []
  }
  return [`--browser=${browser}`]
}

export const runFixture = async (name: string, args: readonly string[] = []): Promise<FixtureResult> => {
  const binaryPath = join(root, 'packages', 'test-with-playwright', 'bin', 'test-with-playwright.js')
  const cwd = join(root, 'packages', 'e2e', 'fixtures', name, 'e2e')
  if (!existsSync(cwd)) {
    throw new Error('cwd does not exist')
  }
  const usesConfig = name === 'sample.hello-world'
  const serverArgs = usesConfig ? [] : ['--server-path', serverPath]
  const child = fork(binaryPath, ['--headless', ...serverArgs, ...getBrowserArgs(), ...args], {
    cwd,
    env: {
      ...process.env,
      ONLY_EXTENSION: usesConfig ? '' : '../extension',
      TEST_PATH: usesConfig ? '' : '.',
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
