export const { argv } = process

export const { env } = process

export const exit = (code: number): never => {
  throw new Error(`Process exit with code ${code}`)
}

export const on = (event: string, listener: (...args: any[]) => void): void => {
  process.on(event, listener)
}
