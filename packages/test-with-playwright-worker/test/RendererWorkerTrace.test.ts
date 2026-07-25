import { expect, jest, test } from '@jest/globals'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as RendererWorkerTrace from '../src/parts/RendererWorkerTrace/RendererWorkerTrace.ts'

test('exportTrace writes browser trace json', async () => {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'renderer-worker-trace-'))
  try {
    const directory = join(temporaryDirectory, 'traces')
    const text = JSON.stringify({
      entries: [
        {
          direction: 'sent',
          method: 'Layout.handleResize',
          params: [800, 600],
          timestamp: 1,
        },
      ],
      version: 1,
    })
    const page = {
      evaluate: jest.fn(async (): Promise<string> => text),
    }
    await RendererWorkerTrace.prepareDirectory(directory)

    await expect(
      RendererWorkerTrace.exportTrace({
        directory,
        page: page as any,
        test: 'viewlet.explorer-open.js',
      }),
    ).resolves.toBe(true)
    await expect(readFile(join(directory, 'viewlet.explorer-open.json'), 'utf8')).resolves.toBe(`${text}\n`)
  } finally {
    await rm(temporaryDirectory, {
      force: true,
      recursive: true,
    })
  }
})

test('exportTrace ignores pages without renderer worker trace data', async () => {
  const page = {
    evaluate: jest.fn(async (): Promise<undefined> => undefined),
  }

  await expect(
    RendererWorkerTrace.exportTrace({
      directory: '/tmp/renderer-worker-traces',
      page: page as any,
      test: 'viewlet.explorer-open.js',
    }),
  ).resolves.toBe(false)
})
