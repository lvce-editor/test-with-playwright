import { formatDuration } from '../FormatDuration/FormatDuration.ts'
import * as TestPrefix from '../TestPrefix/TestPrefix.ts'
import * as TestState from '../TestState/TestState.ts'

interface TestResult {
  name: string
  start: number
  end: number
  status: string
  error?: string
}

const getDuration = (start: number, end: number): number => {
  return end - start
}

const handleResultPassed = (result: Readonly<TestResult>): void => {
  const { name, start, end } = result
  const duration = getDuration(start, end)
  const formattedDuration = formatDuration(duration)
  console.info(`${TestPrefix.Pass} ${name} in ${formattedDuration}`)
}

const handleResultSkipped = (result: Readonly<TestResult>): void => {
  const { name } = result
  console.info(`${TestPrefix.Skip} ${name}`)
}

const handleResultFailed = (result: Readonly<TestResult>): void => {
  const { name, error } = result
  console.error(`${TestPrefix.Fail} ${name}: ${error}`)
}

export const handleResult = (result: Readonly<TestResult>): void => {
  const { status } = result
  switch (status) {
    // @ts-ignore
    case TestState.Pass:
      handleResultPassed(result)
      break
    // @ts-ignore
    case TestState.Skip:
      handleResultSkipped(result)
      break
    // @ts-ignore
    case TestState.Fail:
      handleResultFailed(result)
      break
    default:
      throw new Error(`unexpected test state: ${status}`)
  }
}
