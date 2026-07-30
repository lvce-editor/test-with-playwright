export const { argv } = process

export const { env } = process

export const on = (event: string, listener: (...args: any[]) => void): void => {
  process.on(event, listener)
}
