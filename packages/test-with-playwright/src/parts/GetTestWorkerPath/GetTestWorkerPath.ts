import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import * as Root from '../Root/Root.ts'

export const getTestWorkerUrl = (): string => {
  const path = join(Root.root, 'packages', 'test-with-playwright-worker', 'src', 'workerMain.ts')
  return pathToFileURL(path).toString()
}
