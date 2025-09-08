export const handleUncaughtExceptionMonitor = (error: Error): void => {
  console.error(`[test] uncaught exception ${error}`)
}
