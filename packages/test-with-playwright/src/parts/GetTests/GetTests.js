import { readdir } from 'fs/promises'

/**
 * @param {string} testSrc
 */
export const getTests = async (testSrc) => {
  const dirents = await readdir(testSrc)
  return dirents
}
