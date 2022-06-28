import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { closeAll, getRoot, runTest, startAll, state } from './main.js'

const getTestFiles = async (root) => {
  return readdirSync(root).map((x) => join(root, x))
}

const main = async () => {
  try {
    const start = performance.now()
    state.runImmediately = false
    await startAll()
    console.info('SETUP COMPLETE')
    const root = await getRoot()
    state.root = root
    const testFiles = await getTestFiles(join(root, 'src'))
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
