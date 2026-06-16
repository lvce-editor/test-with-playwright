import { basename, extname } from 'node:path'

const getHtmlFileName = (test: string): string => {
  const baseName = basename(test)
  const extension = extname(baseName)
  if (!extension) {
    return `${baseName}.html`
  }
  return `${baseName.slice(0, -extension.length)}.html`
}

export const getTestUrl = ({
  port,
  test,
  traceFocus,
}: {
  readonly port: number
  readonly test: string
  readonly traceFocus?: boolean
}): string => {
  const htmlFileName = getHtmlFileName(test)
  const baseUrl = `http://localhost:${port}/tests/${htmlFileName}`
  if (traceFocus) {
    return `${baseUrl}?traceFocus=true`
  }
  return baseUrl
}
