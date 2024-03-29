import { readdir } from 'fs/promises'
import VError from 'verror'
import * as ErrorCodes from '../ErrorCodes/ErrorCodes.js'
import * as IsTestFile from '../IsTestFile/IsTestFile.js'
import { NoTestFilesFoundError } from '../NoTestFilesFoundError/NoTestFilesFoundError.js'

/**
 * @param {string} testSrc
 */
export const getTests = async (testSrc) => {
  try {
    const dirents = await readdir(testSrc)
    return dirents.filter(IsTestFile.isTestFile)
  } catch (error) {
    // @ts-ignore
    if (error && error.code === ErrorCodes.ENOENT) {
      throw new NoTestFilesFoundError(testSrc)
    }
    // @ts-ignore
    throw new VError(error, `Failed to get test files`)
  }
}
