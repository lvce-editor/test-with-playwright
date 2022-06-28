import type { Page } from '@playwright/test'

export const runWithExtension: ({
  folder,
  env,
}: {
  folder?: string
  env?: any
}) => Promise<Page>

export const test: {
  (name: string, fn: () => Promise<void>): void
  skip: (name: string, fn: () => Promise<void>) => void
}

export { expect } from '@playwright/test'
