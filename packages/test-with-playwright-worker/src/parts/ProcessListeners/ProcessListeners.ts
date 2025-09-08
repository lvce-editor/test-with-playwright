export const handleUncaughtExceptionMonitor = (error: Error): void => {
  console.log(`[test-worker] uncaught exception ${error}`)
}
