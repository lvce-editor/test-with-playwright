import { dirname } from 'node:path'
import { readPackageUp } from 'read-pkg-up'

export const getRoot = async () => {
  const rootPackageJson = await readPackageUp()
  if (!rootPackageJson) {
    throw new Error('package json not found')
  }
  return dirname(rootPackageJson.path)
}
