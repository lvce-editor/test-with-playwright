import { fork } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const root = join(__dirname, '..', '..', '..')

/**
 *
 * @param {any} childProcess
 */
const waitForChildProcessToExit = async (childProcess) => {
  const { code, stdout, stderr } = await new Promise((resolve) => {
    let stdout = ''
    let stderr = ''
    /**
     *
     * @param {any} value
     */
    const cleanup = (value) => {
      childProcess.stdout.off('data', handleStdoutData)
      childProcess.stderr.off('data', handleStderrData)
      childProcess.off('exit', handleExit)
      resolve(value)
    }
    /**
     *
     * @param {number} code
     */
    const handleExit = (code) => {
      cleanup({ code, stdout, stderr })
    }

    /**
     * @param {any} data
     */
    const handleStdoutData = (data) => {
      console.info({ stdout: data.toString() })
      stdout += data
    }

    /**
     * @param {any} data
     */
    const handleStderrData = (data) => {
      console.info({ stderr: data.toString() })
      stderr += data
    }
    // @ts-ignore
    childProcess.stdout.on('data', handleStdoutData)
    // @ts-ignore
    childProcess.stderr.on('data', handleStderrData)
    childProcess.on('exit', handleExit)
  })

  return {
    code,
    stdout,
    stderr,
  }
}

/**
 * @param {string} name
 */
export const runFixture = async (name) => {
  const binaryPath = join(root, 'packages', 'test-with-playwright', 'bin', 'test-with-playwright.js')
  const cwd = join(root, 'fixtures', name, 'e2e')
  if (!existsSync(cwd)) {
    throw new Error('cwd does not exist')
  }
  const child = fork(binaryPath, ['--headless'], {
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
