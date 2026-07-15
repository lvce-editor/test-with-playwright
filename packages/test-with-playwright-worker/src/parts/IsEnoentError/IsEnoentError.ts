import * as ErrorCodes from '../ErrorCodes/ErrorCodes.ts'

/**
 * @param {any} error
 */
export const isEnoentError = (error: any): boolean => {
  return Boolean(error && error.code === ErrorCodes.ENOENT)
}
