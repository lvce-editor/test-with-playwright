import type { Dirent } from 'node:fs'

/**
 * @param {Dirent} dirent
 */
export const isTestFile = (dirent: Dirent): boolean => {
  return dirent.isFile() && !dirent.name.startsWith('_') && (dirent.name.endsWith('.js') || dirent.name.endsWith('.ts'))
}
