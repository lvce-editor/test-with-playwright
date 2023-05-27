import * as ErrorCodes from '../ErrorCodes/ErrorCodes.js'

export class NoTestFilesFoundError extends Error {
  constructor(root) {
    super(`No test files found at ${root}`)
    this.code = ErrorCodes.E_NO_TEST_FILES
  }
}
