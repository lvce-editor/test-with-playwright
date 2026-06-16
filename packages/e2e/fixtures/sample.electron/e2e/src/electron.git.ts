import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'electron.git'

const toPath = (uri: string): string => {
  if (uri.startsWith('file://')) {
    return uri.slice('file://'.length)
  }
  return uri
}

export const test: Test = async ({ FileSystem, Git, Workspace }) => {
  const tmpDirUri = await FileSystem.getTmpDir({ scheme: 'file' })
  const tmpDir = toPath(tmpDirUri)
  await Workspace.setPath(tmpDir)
  await FileSystem.writeFile(`${tmpDirUri}/README.md`, '# Electron E2E\n')
  await Git.init({ initialBranch: 'main', uri: tmpDir })
  await Git.config({
    'user.email': 'e2e@example.com',
    'user.name': 'Electron E2E',
  })
  await Git.addAll()
  await Git.commit('initial commit')
  await Git.shouldHaveCommit('initial commit')
}
