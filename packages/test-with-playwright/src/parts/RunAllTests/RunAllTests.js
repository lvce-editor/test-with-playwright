import parseArgv from 'minimist'
import { join } from 'node:path'
import * as CloseAll from '../CloseAll/CloseAll.js'
import * as ExitCode from '../ExitCode/ExitCode.js'
import * as GetRoot from '../GetRoot/GetRoot.js'
import * as GetTestFiles from '../GetTestFiles/GetTestFiles.js'
import * as Process from '../Process/Process.js'
import * as RunTests from '../RunTests/RunTests.js'
import * as StartAll from '../StartAll/StartAll.js'

/**
 *
 * @param {any} options
 */
const getEnv = (options) => {
  const env = Object.create(null)
  if (options['only-extension']) {
    env['ONLY_EXTENSION'] = options['only-extension']
  }
  if (options['test-path']) {
    env['TEST_PATH'] = options['test-path']
  }
  return env
}

const main = async () => {
  try {
    const argv = Process.argv.slice(2)
    const options = parseArgv(argv)
    const env = getEnv(options)
    const { page, port } = await StartAll.startAll(env)
    const root = await GetRoot.getRoot()
    const testFiles = await GetTestFiles.getTestFiles(join(root, 'src'))
    console.log({ testFiles })
    await RunTests.runTests({
      testFiles,
      options,
      page,
      port,
    })
  } catch (error) {
    console.info('tests failed')
    console.error(error)
    Process.exit(ExitCode.Error)
  } finally {
    await CloseAll.closeAll()
  }
}

main()
