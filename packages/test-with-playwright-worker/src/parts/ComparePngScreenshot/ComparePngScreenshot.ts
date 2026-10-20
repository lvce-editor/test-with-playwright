import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import * as IsEnoentError from '../IsEnoentError/IsEnoentError.ts'

export const compare = async (path: string, actual: Buffer, update: boolean): Promise<void> => {
  const actualPath = `${path}.actual.png`
  if (update) {
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, actual)
    await rm(actualPath, { force: true })
    return
  }
  let expected: Buffer
  try {
    expected = await readFile(path)
  } catch (error) {
    if (IsEnoentError.isEnoentError(error)) {
      await mkdir(dirname(path), { recursive: true })
      await writeFile(actualPath, actual)
      throw new Error(
        `[SCREENSHOT_MISSING] PNG screenshot is missing: ${path}. Actual output: ${actualPath}. Run with --update-screenshots to create it.`,
      )
    }
    throw error
  }
  if (!actual.equals(expected)) {
    await writeFile(actualPath, actual)
    throw new Error(`[SCREENSHOT_MISMATCH] PNG screenshot differs: ${path}. Actual output: ${actualPath}`)
  }
  await rm(actualPath, { force: true })
}
