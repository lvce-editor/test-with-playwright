export const getFinalResultMessage = (passed: number, skipped: number, failed: number, duration: number): string => {
  if (passed === 0 && skipped === 0 && failed === 0) {
    return `no tests found`
  }
  if (passed === 0 && skipped === 0 && failed === 1) {
    return `${failed} test failed in ${duration}ms`
  }
  if (passed === 0 && skipped === 1 && failed === 0) {
    return `${skipped} test skipped in ${duration}ms`
  }
  if (passed === 0 && skipped === 1 && failed === 1) {
    return `${skipped} test skipped, ${failed} test failed in ${duration}ms`
  }
  if (passed === 1 && skipped === 0 && failed === 0) {
    return `${passed} test passed in ${duration}ms`
  }
  if (passed === 1 && skipped === 0 && failed === 1) {
    return `${passed} test passed, ${failed} test failed in ${duration}ms`
  }
  if (passed === 1 && skipped === 1 && failed === 0) {
    return `${passed} test passed, ${skipped} test skipped in ${duration}ms`
  }
  if (passed === 1 && skipped === 1 && failed === 1) {
    return `${passed} test passed, ${skipped} test skipped, ${failed} test failed in ${duration}ms`
  }
  if (passed > 1 && skipped === 0 && failed === 0) {
    return `${passed} tests passed in ${duration}ms`
  }
  return `${passed} tests passed, ${skipped} tests skipped, ${failed} tests failed in ${duration}ms`
}
