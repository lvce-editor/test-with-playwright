import * as GetFinalResultMessage from '../GetFinalResultMessage/GetFinalResultMessage.ts'

interface FinalResult {
  passed: number
  failed: number
  skipped: number
  start: number
  end: number
}

export const handleFinalResult = (finalResult: Readonly<FinalResult>): void => {
  const { passed, failed, skipped, start, end } = finalResult
  const duration = end - start
  const message = GetFinalResultMessage.getFinalResultMessage(passed, skipped, failed, duration)
  console.warn(message)
  if (failed > 0) {
    process.exitCode = 1
  }
}
