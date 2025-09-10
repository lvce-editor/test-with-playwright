import { ChildProcess, fork } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const __dirname = import.meta.dirname

const root = join(__dirname, '..', '..', '..')

interface ProcessResult {
  code: number | null
  stdout: string
  stderr: string
}

const waitForChildProcessToExit = async (childProcess: ChildProcess): Promise<ProcessResult> => {
  const { resolve, promise } = Promise.withResolvers<ProcessResult>()
  let stdout = ''
  let stderr = ''

  const cleanup = (value: ProcessResult): void => {
    childProcess.stdout?.off('data', handleStdoutData)
    childProcess.stderr?.off('data', handleStderrData)
    childProcess.off('exit', handleExit)
    resolve(value)
  }

  const handleExit = (code: number | null): void => {
    cleanup({ code, stdout, stderr })
  }

  const handleStdoutData = (data: Buffer): void => {
    console.info({ stdout: data.toString() })
    stdout += data
  }

  const handleStderrData = (data: Buffer): void => {
    console.info({ stderr: data.toString() })
    stderr += data
  }

  childProcess.stdout?.on('data', handleStdoutData)
  childProcess.stderr?.on('data', handleStderrData)
  childProcess.on('exit', handleExit)

  const { code } = await promise

  return {
    code,
    stdout,
    stderr,
  }
}

interface FixtureResult {
  stdout: string
  stderr: string
  exitCode: number | null
}

export const runFixture = async (name: string): Promise<FixtureResult> => {
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
