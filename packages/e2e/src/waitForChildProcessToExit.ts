import type { ChildProcess } from 'node:child_process'

interface ProcessResult {
  code: number | null
  stdout: string
  stderr: string
}

export const waitForChildProcessToExit = async (childProcess: ChildProcess): Promise<ProcessResult> => {
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
