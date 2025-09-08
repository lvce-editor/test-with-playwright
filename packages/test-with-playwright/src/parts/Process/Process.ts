export const argv: string[] = process.argv

export const env: NodeJS.ProcessEnv = process.env

export const exit = (code: number): void => {
  process.exit(code)
}

export const on = (event: string, listener: (...args: any[]) => void): void => {
  process.on(event, listener)
}
