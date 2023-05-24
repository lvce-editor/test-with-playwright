import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export const getTmpDir = (prefix = 'foo-') => {
  return mkdtemp(join(tmpdir(), prefix))
}
