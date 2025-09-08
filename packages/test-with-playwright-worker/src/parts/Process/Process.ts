export const on = (event: string, listener: (...args: any[]) => void): void => {
  process.on(event, listener)
}
