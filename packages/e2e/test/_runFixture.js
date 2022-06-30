import { fork } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const root = join(__dirname, '..', '..', '..')

/**
 * @param {string} name
 */
export const runFixture = async (name) => {
  const binaryPath = join(
    root,
    'packages',
    'test-with-playwright',
    'src',
    'all.js'
  )
  const cwd = join(
    root,
    'packages',
    'e2e',
    'test',
    'fixtures',
    name,
    'e2e',
    'src'
  )
  if (!existsSync(cwd)) {
    throw new Error('cwd does not exist')
  }
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
