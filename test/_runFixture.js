import { fork } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const root = join(__dirname, '..')

export const runFixture = async (name) => {
  const binaryPath = join(root, 'src', 'all.js')
  const cwd = join(root, 'test', 'fixtures', name, 'e2e', 'src')
  let stdout = ''
  let stderr = ''
  const child = fork(binaryPath, ['--headless'], { cwd, stdio: 'pipe' })
  // @ts-ignore
  child.stdout.on('data', (data) => {
    console.info({ stdout: data.toString() })
    stdout += data
  })
  // @ts-ignore
  child.stderr.on('data', (data) => {
    console.info({ stderr: data.toString() })
    stderr += data
  })

  await new Promise((resolve, reject) => {
    child.on('exit', (code) => {
      if (code === 0) {
        resolve(undefined)
      } else {
        reject()
      }
    })
  })
  return {
    stdout,
    stderr,
    exitCode: 0, // TODO
  }
}
