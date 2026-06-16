import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { pipeline } from 'node:stream/promises'

export const downloadFile = async ({ url, to }: { readonly url: string; readonly to: string }): Promise<void> => {
  await mkdir(dirname(to), { recursive: true })
  const response = await fetch(url)
  if (!response.ok || !response.body) {
    throw new Error(`[test-with-playwright] failed to download ${url}: ${response.status} ${response.statusText}`)
  }
  await pipeline(response.body, createWriteStream(to))
}
