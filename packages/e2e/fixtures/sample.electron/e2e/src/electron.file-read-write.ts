import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'electron.file-read-write'

const toPath = (uri: string): string => {
  if (uri.startsWith('file://')) {
    return uri.slice('file://'.length)
  }
  return uri
}

export const test: Test = async ({ Editor, FileSystem, Main, Workspace }) => {
  const tmpDirUri = await FileSystem.getTmpDir({ scheme: 'file' })
  const tmpDir = toPath(tmpDirUri)
  const fileUri = `${tmpDirUri}/file.txt`
  await FileSystem.writeFile(fileUri, 'hello')
  await Workspace.setPath(tmpDir)
  await Main.openUri(fileUri)
  await Editor.shouldHaveText('hello')
  await Editor.setCursor(0, 5)
  await Editor.type(' world')
  await Main.save()
  await FileSystem.shouldHaveFile(fileUri, 'hello world')
}
