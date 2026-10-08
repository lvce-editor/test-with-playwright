import type { ConsoleMessage, Page } from '@playwright/test'

const formatConsoleMessage = (type: string, message: ConsoleMessage): string => {
  const { columnNumber, lineNumber, url } = message.location()
  const location = url ? ` (${url}:${lineNumber}:${columnNumber})` : ''
  return `console ${type}: ${message.text()}${location}`
}

export const createPageMessages = (page: Page): { dispose: () => void; messages: string[] } => {
  const messages: string[] = []
  const onConsole = (message: ConsoleMessage): void => {
    const type = message.type()
    if (type === 'warning' || type === 'error') {
      messages.push(formatConsoleMessage(type, message))
    }
  }
  const onPageError = (error: Error): void => {
    messages.push('uncaught page error: ' + (error.stack || error.message))
  }
  page.on('console', onConsole)
  page.on('pageerror', onPageError)
  return {
    dispose: (): void => {
      page.off('console', onConsole)
      page.off('pageerror', onPageError)
    },
    messages,
  }
}

export const formatPageMessages = (messages: readonly string[]): string => {
  const formattedMessages = messages.map((message) => '  ' + message).join('\n')
  return `Browser console messages:\n${formattedMessages}`
}
