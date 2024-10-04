import { readdir } from 'fs/promises'
import VError from 'verror'
import * as IsEnoentError from '../IsEnoentError/IsEnoentError.js'
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
    if (IsEnoentError.isEnoentError(error)) {
      throw new NoTestFilesFoundError(testSrc)
    }
    // @ts-ignore
    throw new VError(error, `Failed to get test files`)
  }
}
