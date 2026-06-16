import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'electron.open-folder-dialog'

const toPath = (uri: string): string => {
  if (uri.startsWith('file://')) {
    return uri.slice('file://'.length)
  }
  return uri
}

export const test: Test = async ({ Command, FileSystem }) => {
  const tmpDirUri = await FileSystem.getTmpDir({ scheme: 'file' })
  const tmpDir = toPath(tmpDirUri)
  await FileSystem.writeFile(`${tmpDirUri}/opened.txt`, 'opened from native dialog')
  await Command.execute('ElectronDialog.mockOpenDialog', [tmpDir])
  try {
    await Command.execute('Dialog.openFolder')
    const workspacePath = await Command.execute('Workspace.getPath')
    if (workspacePath !== tmpDir) {
      throw new Error(`expected workspace path to be "${tmpDir}" but got "${workspacePath}"`)
    }
  } finally {
    await Command.execute('ElectronDialog.resetMockOpenDialog')
  }
}
