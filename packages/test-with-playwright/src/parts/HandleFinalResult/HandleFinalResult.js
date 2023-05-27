export const handleFinalResult = (finalResult) => {
  const { passed, failed, skipped, start, end } = finalResult
  const duration = end - start
  if (skipped) {
    console.info(`${passed} tests passed, ${skipped} tests skipped in ${duration}ms`)
  } else {
    console.info(`${passed} tests passed in ${duration}ms`)
  }
}
