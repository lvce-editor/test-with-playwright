import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import * as ErrorCodes from '../ErrorCodes/ErrorCodes.js'
import * as IsTestFile from '../IsTestFile/IsTestFile.js'
import VError from 'verror'
import { NoTestFilesFoundError } from '../NoTestFilesFoundError/NoTestFIlesFoundError.js'

/**
 * @param {string} root
 */
export const getTestFiles = async (root) => {
  try {
    const dirents = await readdir(root)
    return dirents.filter(IsTestFile.isTestFile).map((x) => join(root, x))
  } catch (error) {
    if (error && error.code === ErrorCodes.ENOENT) {
      throw new NoTestFilesFoundError(root)
    }
    throw new VError(error, `Failed to get test files`)
  }
}
