import { readdir } from 'fs/promises'
import { join } from 'path'

/**
 * @param {string} testSrc
 */
export const getTests = async (testSrc) => {
  const dirents = await readdir(testSrc)
  return dirents
}
