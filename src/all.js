import { readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'
import { closeAll, runTest, startAll, state } from './main.js'

const getTestFiles = async (root) => {
  return readdirSync(root)
    .filter((x) => x !== '_all.js')
    .map((x) => join(root, x))
}

const main = async () => {
  try {
    const start = performance.now()
    state.runImmediately = false
    await startAll()
    console.info('SETUP COMPLETE')
    const root = process.cwd()
    const testFiles = await getTestFiles(root)
    console.log({ testFiles })
    for (const testFile of testFiles) {
      state.tests = []
      await import(testFile)
      for (const test of state.tests) {
        await runTest(test)
      }
    }
    await closeAll()
    const end = performance.now()
    const duration = end - start
    console.info(`${testFiles.length} tests passed in ${duration}ms`)
  } catch (error) {
    console.info('tests failed')
    console.error(error)
    process.exit(1)
  }
}

main()
