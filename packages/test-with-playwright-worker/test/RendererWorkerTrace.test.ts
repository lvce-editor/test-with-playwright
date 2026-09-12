import { expect, jest, test } from '@jest/globals'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as RendererWorkerTrace from '../src/parts/RendererWorkerTrace/RendererWorkerTrace.ts'

const createPage = (text: string | undefined, timeline?: object): any => {
  return {
    evaluate: jest.fn(async (callback: (selector: string) => string | undefined, selector: string) => {
      const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document')
      const originalTimeline = Object.getOwnPropertyDescriptor(globalThis, '__lvceTraceTimeline')
      Object.defineProperties(globalThis, {
        __lvceTraceTimeline: { configurable: true, value: () => timeline },
        document: {
          configurable: true,
          value: {
            querySelector: () => (text === undefined ? null : { textContent: text }),
          },
        },
      })
      try {
        return callback(selector)
      } finally {
        if (originalTimeline) {
          Object.defineProperty(globalThis, '__lvceTraceTimeline', originalTimeline)
        } else {
          delete (globalThis as any).__lvceTraceTimeline
        }
        if (originalDocument) {
          Object.defineProperty(globalThis, 'document', originalDocument)
        } else {
          delete (globalThis as any).document
        }
      }
    }),
  }
}

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
    const page = createPage(text)
    await RendererWorkerTrace.prepareDirectory(directory)

    await expect(
      RendererWorkerTrace.exportTrace({
        directory,
        page,
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
  const page = createPage(undefined)

  await expect(
    RendererWorkerTrace.exportTrace({
      directory: '/tmp/renderer-worker-traces',
      page,
      test: 'viewlet.explorer-open.js',
    }),
  ).resolves.toBe(false)
})

test('exportTrace ignores pages that cannot be evaluated', async () => {
  const page = {
    evaluate: jest.fn(async (): Promise<never> => {
      throw new Error('page closed')
    }),
  }

  await expect(
    RendererWorkerTrace.exportTrace({
      directory: '/tmp/renderer-worker-traces',
      page: page as any,
      test: 'viewlet.explorer-open.js',
    }),
  ).resolves.toBe(false)
})

test.each([undefined, '{"version":1,"entries":[]}'])(
  'exports the timeline even without runtime trace data: %s',
  async (text) => {
    const directory = await mkdtemp(join(tmpdir(), 'trace-timeline-'))
    const timeline = { entries: [{ kind: 'rpc-received', payload: 'render', sequence: 0 }], version: 1 }
    try {
      const result = await RendererWorkerTrace.exportTrace({
        directory,
        page: createPage(text, timeline),
        test: 'sample.js',
      })
      expect(result).toBe(true)
      const output = JSON.parse(await readFile(join(directory, 'sample.json'), 'utf8'))
      expect(output).toEqual({ entries: [], timeline, version: 1 })
    } finally {
      await rm(directory, { force: true, recursive: true })
    }
  },
)
