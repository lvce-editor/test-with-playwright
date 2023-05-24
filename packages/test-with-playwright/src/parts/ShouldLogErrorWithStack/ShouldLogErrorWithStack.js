import * as ErrorCodes from '../ErrorCodes/ErrorCodes.js'

/**
 *
 * @param {any} error
 * @returns
 */
export const shouldLogErrorWithStack = (error) => {
  if (error && error.code === ErrorCodes.E_NO_TEST_FILES) {
    return false
  }
  return true
}
