import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import * as IsTestFile from '../IsTestFile/IsTestFile.js'

/**
 * @param {string} root
 */
export const getTestFiles = async (root) => {
  return readdirSync(root)
    .filter(IsTestFile.isTestFile)
    .map((x) => join(root, x))
}
