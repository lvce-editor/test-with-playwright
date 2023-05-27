import * as GetFinalResultMessage from '../GetFinalResultMessage/GetFinalResultMessage.js'

export const handleFinalResult = (finalResult) => {
  const { passed, failed, skipped, start, end } = finalResult
  const duration = end - start
  const message = GetFinalResultMessage.getFinalResultMessage(passed, skipped, failed, duration)
  console.info(message)
}
