import { VError } from '@lvce-editor/verror'
import { readdir } from 'fs/promises'
import * as IsEnoentError from '../IsEnoentError/IsEnoentError.ts'
import * as IsTestFile from '../IsTestFile/IsTestFile.ts'
import { NoTestFilesFoundError } from '../NoTestFilesFoundError/NoTestFilesFoundError.ts'

const getName = (dirent) => {
  return dirent.name
}

/**
 * @param {string} testSrc
 */
export const getTests = async (testSrc): Promise<void> => {
  try {
    const dirents = await readdir(testSrc, {
      withFileTypes: true,
    })
    // @ts-ignore
    return dirents.filter(IsTestFile.isTestFile).map(getName)
  } catch (error) {
    // @ts-ignore
    if (IsEnoentError.isEnoentError(error)) {
      throw new NoTestFilesFoundError(testSrc)
    }
    throw new VError(error, `Failed to get test files`)
  }
}
