import { join } from 'node:path'
import * as Root from '../Root/Root.js'

export const getTestWorkerPath = () => {
  return join(Root.root, 'packages', 'test-with-playwright-worker', 'src', 'workerMain.js')
}
