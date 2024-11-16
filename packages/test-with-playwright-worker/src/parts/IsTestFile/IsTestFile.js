import { Dirent } from 'node:fs'

/**
 * @param {Dirent} dirent
 */
export const isTestFile = (dirent) => {
  return dirent.isFile() && !dirent.name.startsWith('_')
}
