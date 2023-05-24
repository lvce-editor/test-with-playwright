import { fork } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import * as GetRoot from '../GetRoot/GetRoot.js'
import * as GetTmpDir from '../GetTmpDir/GetTmpDir.js'
import * as TestState from '../TestState/TestState.js'

const getExtensionFolder = async () => {
  const root = TestState.state.root || (await GetRoot.getRoot())
  return join(root, '..', 'extension')
}

export const launchServer = async ({ port, folder, env }) => {
  const { serverPath } = await import('@lvce-editor/server')
  // TODO disable saving state between tests in settings
  const configDir = await GetTmpDir.getTmpDir()
  await mkdir(join(configDir, 'lvce-oss'), { recursive: true })
  await writeFile(
    join(configDir, 'lvce-oss', 'settings.json'),
    JSON.stringify(
      {
        'workbench.saveStateOnVisibilityChange': false,
      },
      null,
      2
    )
  )
  const extensionFolder = await getExtensionFolder()
  const childProcess = fork(serverPath, {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: port,
      FOLDER: folder,
      ONLY_EXTENSION: extensionFolder,
      XDG_CONFIG_HOME: configDir,
      ...env,
    },
  })
  TestState.state.childProcess = childProcess
  return new Promise((resolve, reject) => {
    const handleMessage = (message) => {
      if (message === 'ready') {
        resolve(undefined)
      } else {
        reject(new Error('expected ready message'))
      }
    }
    childProcess.once('message', handleMessage)
  })
}
