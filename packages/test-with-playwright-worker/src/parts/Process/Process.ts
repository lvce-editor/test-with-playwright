export const on = (event: string, listener: (...args: readonly any[]) => void): void => {
  process.on(event, listener)
}
