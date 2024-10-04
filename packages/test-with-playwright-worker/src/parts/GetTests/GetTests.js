import { VError } from '@lvce-editor/verror'
import { readdir } from 'fs/promises'
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
    throw new VError(error, `Failed to get test files`)
  }
}
