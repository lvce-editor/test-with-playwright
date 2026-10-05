import { expect, jest, test } from '@jest/globals'
import { EventEmitter } from 'node:events'
import * as WorkerJavascriptCoverage from '../src/parts/WorkerJavascriptCoverage/WorkerJavascriptCoverage.ts'

class MockCDPSession extends EventEmitter {
  readonly calls: { method: string; params: object }[] = []

  withheldMethod = ''

  errorMethod = ''

  errorMessage = 'mock protocol failure'

  rejectOuterMethod = ''

  rejectOuterMessage: unknown = new Error('mock protocol failure')

  coverageResult: any[] = [
    {
      functions: [
        { functionName: 'about', isBlockCoverage: true, ranges: [{ count: 1, endOffset: 5, startOffset: 0 }] },
      ],
      scriptId: '1',
      url: 'http://localhost/aboutWorkerMain.js',
    },
  ]

  async send(method: string, params: object = {}): Promise<any> {
    if (method === 'Target.sendMessageToTarget') {
      const { id, method: targetMethod, params: targetParams } = JSON.parse((params as any).message)
      if (this.rejectOuterMethod === targetMethod) {
        throw this.rejectOuterMessage
      }
      this.calls.push({ method: targetMethod, params: targetParams })
      if (targetMethod === this.withheldMethod) {
        return {}
      }
      let result: Record<string, unknown> = {}
      if (targetMethod === 'Profiler.takePreciseCoverage') {
        result = { result: this.coverageResult }
      } else if (targetMethod === 'Debugger.getScriptSource') {
        result = { scriptSource: 'const about = true' }
      }
      if (this.errorMethod === targetMethod) {
        result = { error: { message: this.errorMessage } }
      }
      setImmediate(() => {
        this.emit('Target.receivedMessageFromTarget', {
          message: JSON.stringify(result.error ? { error: result.error, id } : { id, result }),
          sessionId: (params as any).sessionId,
        })
      })
      return {}
    }
    this.calls.push({ method, params })
    switch (method) {
      default:
        return {}
    }
  }

  async detach(): Promise<void> {}
}

const createPage = (session: MockCDPSession): any => ({
  context: (): { newCDPSession: () => Promise<MockCDPSession> } => ({
    newCDPSession: async (): Promise<MockCDPSession> => session,
  }),
})

const attachWorker = async (session: MockCDPSession, sessionId = 'worker-1'): Promise<void> => {
  session.emit('Target.attachedToTarget', {
    sessionId,
    targetInfo: { type: 'worker', url: 'http://localhost/aboutWorkerMain.js' },
  })
  for (let attempt = 0; attempt < 100; attempt++) {
    const resumed = session.calls.some(({ method, params }) => {
      return method === 'Runtime.runIfWaitingForDebugger' && JSON.stringify(params) === JSON.stringify({})
    })
    if (resumed) {
      await new Promise<void>((resolve) => setTimeout(resolve, 10))
      return
    }
    await new Promise<void>((resolve) => setImmediate(resolve))
  }
  throw new Error('worker attachment did not finish')
}

test('starts coverage before resuming the matching worker and collects its script', async (): Promise<void> => {
  const session = new MockCDPSession()
  const coverage = await WorkerJavascriptCoverage.startWorkerJavascriptCoverage(
    createPage(session),
    'aboutWorkerMain.js',
  )
  await attachWorker(session)

  const entries = await coverage.stop()

  const methods = session.calls.map(({ method }) => method)
  expect(methods.filter((method) => method === 'Target.setAutoAttach')).toHaveLength(2)
  expect(methods).toContain('Debugger.enable')
  expect(methods).toContain('Profiler.enable')
  expect(methods).toContain('Profiler.startPreciseCoverage')
  expect(methods).toContain('Runtime.runIfWaitingForDebugger')
  expect(methods).toContain('Profiler.takePreciseCoverage')
  expect(methods).toContain('Debugger.getScriptSource')
  expect(methods).toContain('Profiler.stopPreciseCoverage')
  expect(methods.indexOf('Profiler.startPreciseCoverage')).toBeLessThan(
    methods.indexOf('Runtime.runIfWaitingForDebugger'),
  )
  expect(entries).toMatchObject([
    { scriptId: '1', source: 'const about = true', url: 'http://localhost/aboutWorkerMain.js' },
  ])
  expect(entries[0].functions[0].ranges[0].count).toBeGreaterThan(1)
})

test('resumes unrelated worker targets without collecting them', async (): Promise<void> => {
  const session = new MockCDPSession()
  const coverage = await WorkerJavascriptCoverage.startWorkerJavascriptCoverage(
    createPage(session),
    'aboutWorkerMain.js',
  )
  session.emit('Target.attachedToTarget', {
    sessionId: 'other-worker',
    targetInfo: { type: 'worker', url: 'http://localhost/otherWorker.js' },
  })
  session.emit('Target.detachedFromTarget', { sessionId: 'other-worker' })
  await new Promise<void>((resolve) => setImmediate(resolve))

  await expect(coverage.stop()).rejects.toThrow('no JavaScript coverage was collected')
  expect(session.calls.map(({ method }) => method)).toEqual([
    'Target.setAutoAttach',
    'Runtime.runIfWaitingForDebugger',
    'Target.setAutoAttach',
  ])
})

test('returns the same collected entries when stopped more than once', async (): Promise<void> => {
  const session = new MockCDPSession()
  const coverage = await WorkerJavascriptCoverage.startWorkerJavascriptCoverage(
    createPage(session),
    'aboutWorkerMain.js',
  )
  await attachWorker(session)
  const entries = await coverage.stop()
  expect(await coverage.stop()).toEqual(entries)
})

test('ignores targets which are not workers', async (): Promise<void> => {
  const session = new MockCDPSession()
  const coverage = await WorkerJavascriptCoverage.startWorkerJavascriptCoverage(
    createPage(session),
    'aboutWorkerMain.js',
  )
  session.emit('Target.attachedToTarget', {
    sessionId: 'page-1',
    targetInfo: { type: 'page', url: 'http://localhost/aboutWorkerMain.js' },
  })
  await new Promise<void>((resolve) => setImmediate(resolve))
  await expect(coverage.stop()).rejects.toThrow('no JavaScript coverage was collected')
})

test('ignores scripts without URLs and rejects empty coverage', async (): Promise<void> => {
  const session = new MockCDPSession()
  session.coverageResult = [{ functions: [], scriptId: '1', url: '' }]
  const coverage = await WorkerJavascriptCoverage.startWorkerJavascriptCoverage(
    createPage(session),
    'aboutWorkerMain.js',
  )
  await attachWorker(session)
  await expect(coverage.stop()).rejects.toThrow('no JavaScript coverage was collected')
})

test('reports errors while enabling the worker debugger and still resumes it', async (): Promise<void> => {
  const session = new MockCDPSession()
  session.errorMethod = 'Debugger.enable'
  const coverage = await WorkerJavascriptCoverage.startWorkerJavascriptCoverage(
    createPage(session),
    'aboutWorkerMain.js',
  )
  await attachWorker(session)
  await expect(coverage.stop()).rejects.toThrow('mock protocol failure')
  expect(session.calls.map(({ method }) => method)).toContain('Runtime.runIfWaitingForDebugger')
})

test('does not fail if a worker closes while coverage is being stopped', async (): Promise<void> => {
  const session = new MockCDPSession()
  session.errorMethod = 'Profiler.stopPreciseCoverage'
  const coverage = await WorkerJavascriptCoverage.startWorkerJavascriptCoverage(
    createPage(session),
    'aboutWorkerMain.js',
  )
  await attachWorker(session)
  await expect(coverage.stop()).resolves.toHaveLength(1)
})

test('handles protocol replies without an id or for an unknown command', async (): Promise<void> => {
  const session = new MockCDPSession()
  const coverage = await WorkerJavascriptCoverage.startWorkerJavascriptCoverage(
    createPage(session),
    'aboutWorkerMain.js',
  )
  session.emit('Target.receivedMessageFromTarget', { message: JSON.stringify({ result: {} }) })
  session.emit('Target.receivedMessageFromTarget', { message: JSON.stringify({ id: 999, result: {} }) })
  await attachWorker(session)
  await expect(coverage.stop()).resolves.toHaveLength(1)
})

test('ignores detached workers during final collection', async (): Promise<void> => {
  const session = new MockCDPSession()
  const coverage = await WorkerJavascriptCoverage.startWorkerJavascriptCoverage(
    createPage(session),
    'aboutWorkerMain.js',
  )
  await attachWorker(session)
  session.emit('Target.detachedFromTarget', { sessionId: 'worker-1' })
  await expect(coverage.stop()).resolves.toHaveLength(1)
})

test('ignores a worker that closes during a coverage snapshot', async (): Promise<void> => {
  const session = new MockCDPSession()
  session.errorMethod = 'Profiler.takePreciseCoverage'
  session.errorMessage = 'Target closed'
  const coverage = await WorkerJavascriptCoverage.startWorkerJavascriptCoverage(
    createPage(session),
    'aboutWorkerMain.js',
  )
  await attachWorker(session)
  session.errorMethod = ''
  await expect(coverage.stop()).resolves.toHaveLength(1)
})

test('rejects a failed outer CDP send and attempts to resume the worker', async (): Promise<void> => {
  const session = new MockCDPSession()
  session.rejectOuterMethod = 'Debugger.enable'
  const coverage = await WorkerJavascriptCoverage.startWorkerJavascriptCoverage(
    createPage(session),
    'aboutWorkerMain.js',
  )
  await attachWorker(session)
  await expect(coverage.stop()).rejects.toThrow('mock protocol failure')
  expect(session.calls.map(({ method }) => method)).toContain('Runtime.runIfWaitingForDebugger')
})

test('converts non-error CDP failures to errors', async (): Promise<void> => {
  const session = new MockCDPSession()
  session.rejectOuterMethod = 'Debugger.enable'
  session.rejectOuterMessage = 'string failure'
  const coverage = await WorkerJavascriptCoverage.startWorkerJavascriptCoverage(
    createPage(session),
    'aboutWorkerMain.js',
  )
  await attachWorker(session)
  await expect(coverage.stop()).rejects.toThrow('string failure')
})

test('reports a coverage snapshot failure during final collection', async (): Promise<void> => {
  const session = new MockCDPSession()
  const coverage = await WorkerJavascriptCoverage.startWorkerJavascriptCoverage(
    createPage(session),
    'aboutWorkerMain.js',
  )
  await attachWorker(session)
  await new Promise<void>((resolve) => setTimeout(resolve, 10))
  session.errorMethod = 'Profiler.takePreciseCoverage'
  await expect(coverage.stop()).rejects.toThrow('mock protocol failure')
})

test('records periodic snapshot errors and stops polling detached workers', async (): Promise<void> => {
  const session = new MockCDPSession()
  const coverage = await WorkerJavascriptCoverage.startWorkerJavascriptCoverage(
    createPage(session),
    'aboutWorkerMain.js',
  )
  await attachWorker(session)
  await new Promise<void>((resolve) => setTimeout(resolve, 10))
  session.errorMethod = 'Profiler.takePreciseCoverage'
  await new Promise<void>((resolve) => setTimeout(resolve, 60))
  session.emit('Target.detachedFromTarget', { sessionId: 'worker-1' })
  await expect(coverage.stop()).rejects.toThrow('mock protocol failure')
})

test('clears periodic collection timers when coverage stops', async (): Promise<void> => {
  const session = new MockCDPSession()
  const coverage = await WorkerJavascriptCoverage.startWorkerJavascriptCoverage(
    createPage(session),
    'aboutWorkerMain.js',
  )
  await attachWorker(session)
  await new Promise<void>((resolve) => setTimeout(resolve, 10))
  await expect(coverage.stop()).resolves.toHaveLength(1)
})

test('keeps worker sessions attached until the final snapshot and profiler stop finish', async (): Promise<void> => {
  const session = new MockCDPSession()
  const coverage = await WorkerJavascriptCoverage.startWorkerJavascriptCoverage(
    createPage(session),
    'aboutWorkerMain.js',
  )
  await attachWorker(session)
  await coverage.stop()

  const methods = session.calls.map(({ method }) => method)
  expect(methods.lastIndexOf('Target.setAutoAttach')).toBeGreaterThan(
    methods.lastIndexOf('Profiler.stopPreciseCoverage'),
  )
})

test('settles an outstanding coverage command when its worker detaches without a reply', async (): Promise<void> => {
  const session = new MockCDPSession()
  const coverage = await WorkerJavascriptCoverage.startWorkerJavascriptCoverage(
    createPage(session),
    'aboutWorkerMain.js',
  )
  await attachWorker(session)
  session.withheldMethod = 'Profiler.takePreciseCoverage'
  const stopped = coverage.stop()
  await new Promise<void>((resolve) => setImmediate(resolve))
  session.emit('Target.detachedFromTarget', { sessionId: 'worker-1' })

  await expect(stopped).resolves.toHaveLength(1)
  expect(session.listenerCount('Target.detachedFromTarget')).toBe(0)
})

test('does not start polling when worker initialization finishes after stop begins', async (): Promise<void> => {
  const session = new MockCDPSession()
  const coverage = await WorkerJavascriptCoverage.startWorkerJavascriptCoverage(
    createPage(session),
    'aboutWorkerMain.js',
  )
  const polling = jest.spyOn(globalThis, 'setInterval')
  try {
    session.emit('Target.attachedToTarget', {
      sessionId: 'worker-1',
      targetInfo: { type: 'worker', url: 'http://localhost/aboutWorkerMain.js' },
    })
    await expect(coverage.stop()).resolves.toHaveLength(1)
    expect(polling).not.toHaveBeenCalled()
  } finally {
    polling.mockRestore()
  }
})

test('settles a detached unrelated worker resume without cancelling other worker commands', async (): Promise<void> => {
  const session = new MockCDPSession()
  const coverage = await WorkerJavascriptCoverage.startWorkerJavascriptCoverage(
    createPage(session),
    'aboutWorkerMain.js',
  )
  await attachWorker(session)
  session.withheldMethod = 'Runtime.runIfWaitingForDebugger'
  session.emit('Target.attachedToTarget', {
    sessionId: 'other-worker',
    targetInfo: { type: 'worker', url: 'http://localhost/otherWorker.js' },
  })
  session.emit('Target.detachedFromTarget', { sessionId: 'other-worker' })
  await expect(coverage.stop()).resolves.toHaveLength(1)
})
