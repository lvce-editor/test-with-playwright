import * as ErrorCodes from '../ErrorCodes/ErrorCodes.js'

/**
 * @param {any} error
 */
export const isEnoentError = (error) => {
  return error && error.code === ErrorCodes.ENOENT
}
