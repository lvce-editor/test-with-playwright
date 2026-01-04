import * as GetFinalResultMessage from '../GetFinalResultMessage/GetFinalResultMessage.ts'

interface FinalResult {
  end: number
  failed: number
  passed: number
  skipped: number
  start: number
}

export const handleFinalResult = (finalResult: Readonly<FinalResult>): void => {
  const { end, failed, passed, skipped, start } = finalResult
  const duration = end - start
  const message = GetFinalResultMessage.getFinalResultMessage(passed, skipped, failed, duration)
  console.info(message)
  if (failed > 0) {
    process.exitCode = 1
  }
}
