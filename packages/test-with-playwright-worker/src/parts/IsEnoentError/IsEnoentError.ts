import * as ErrorCodes from '../ErrorCodes/ErrorCodes.ts'

/**
 * @param {any} error
 */
export const isEnoentError = (error): void => {
  return error && error.code === ErrorCodes.ENOENT
}
