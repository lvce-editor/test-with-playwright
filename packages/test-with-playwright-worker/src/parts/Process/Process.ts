export const on = (event: string, listener: (...args: unknown[]) => void): void => {
  process.on(event, listener)
}
