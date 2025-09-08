import { join } from 'node:path'
import * as Root from '../Root/Root.ts'
import { fileURLToPath } from 'node:url'

export const getTestWorkerUrl = (): string => {
  const path = join(Root.root, 'packages', 'test-with-playwright-worker', 'src', 'workerMain.ts')
  return fileURLToPath(path)
}
