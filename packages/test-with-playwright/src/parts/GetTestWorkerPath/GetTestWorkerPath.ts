import { join } from 'node:path'
import * as Root from '../Root/Root.ts'

export const getTestWorkerPath = (): string => {
  return join(Root.root, 'packages', 'test-with-playwright-worker', 'src', 'workerMain.js')
}
