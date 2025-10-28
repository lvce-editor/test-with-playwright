import { formatDuration } from '../FormatDuration/FormatDuration.ts'

export const getFinalResultMessage = (passed: number, skipped: number, failed: number, duration: number): string => {
  if (passed === 0 && skipped === 0 && failed === 0) {
    return `no tests found`
  }
  const formattedDuration = formatDuration(duration)
  if (passed === 0 && skipped === 0 && failed === 1) {
    return `${failed} test failed in ${formattedDuration}`
  }
  if (passed === 0 && skipped === 1 && failed === 0) {
    return `${skipped} test skipped in ${formattedDuration}`
  }
  if (passed === 0 && skipped === 1 && failed === 1) {
    return `${skipped} test skipped, ${failed} test failed in ${formattedDuration}`
  }
  if (passed === 1 && skipped === 0 && failed === 0) {
    return `${passed} test passed in ${formattedDuration}`
  }
  if (passed === 1 && skipped === 0 && failed === 1) {
    return `${passed} test passed, ${failed} test failed in ${formattedDuration}`
  }
  if (passed === 1 && skipped === 1 && failed === 0) {
    return `${passed} test passed, ${skipped} test skipped in ${formattedDuration}`
  }
  if (passed === 1 && skipped === 1 && failed === 1) {
    return `${passed} test passed, ${skipped} test skipped, ${failed} test failed in ${formattedDuration}`
  }
  if (passed > 1 && skipped === 0 && failed === 0) {
    return `${passed} tests passed in ${formattedDuration}`
  }
  return `${passed} tests passed, ${skipped} tests skipped, ${failed} tests failed in ${formattedDuration}`
}
