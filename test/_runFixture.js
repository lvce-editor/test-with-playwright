import { execaNode } from 'execa'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const root = join(__dirname, '..')

export const runFixture = async (name) => {
  const binaryPath = join(root, 'src', 'all.js')
  const cwd = join(root, 'test', 'fixtures', name, 'e2e', 'src')
  const { stdout, stderr, exitCode } = await execaNode(
    binaryPath,
    ['--headless'],
    {
      cwd,
      // stdio: 'inherit',
    }
  )
  return {
    stdout,
    stderr,
    exitCode,
  }
}
