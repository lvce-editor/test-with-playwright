import * as TestState from '../TestState/TestState.js'

const getDuration = (start, end) => {
  return end - start
}

const handleResultPassed = (result) => {
  const { name, start, end } = result
  const duration = getDuration(start, end)
  console.info(`test passed ${name} in ${duration}ms`)
}

const handleResultSkipped = (result) => {
  const { name } = result
  console.info(`test skipped ${name}`)
}

const handleResultFailed = (result) => {
  const { name, error } = result
  console.error(`Test Failed ${name}: ${error}`)
}

export const handleResult = (result) => {
  const { status } = result
  switch (status) {
    case TestState.Pass:
      handleResultPassed(result)
      break
    case TestState.Skip:
      handleResultSkipped(result)
      break
    case TestState.Fail:
      handleResultFailed(result)
      break
    default:
      throw new Error(`unexpected test state: ${status}`)
  }
}
