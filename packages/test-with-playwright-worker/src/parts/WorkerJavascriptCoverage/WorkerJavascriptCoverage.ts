import type { CDPSession, Page } from '@playwright/test'

export interface JavascriptCoverageEntry {
  readonly functions: {
    functionName: string
    isBlockCoverage: boolean
    ranges: { count: number; endOffset: number; startOffset: number }[]
  }[]
  readonly scriptId: string
  readonly source: string
  readonly url: string
}

interface AttachedTarget {
  readonly sessionId: string
  readonly targetInfo: {
    readonly type: string
    readonly url: string
  }
}

export interface WorkerJavascriptCoverage {
  stop(): Promise<readonly JavascriptCoverageEntry[]>
}

const trackPromise = (
  promises: Set<Promise<void>>,
  promise: Promise<void>,
  onError: (error: unknown) => Promise<void> | void,
): void => {
  let trackedPromise: Promise<void> = Promise.resolve()
  trackedPromise = (async (): Promise<void> => {
    try {
      await promise
    } catch (error) {
      await onError(error)
    } finally {
      promises.delete(trackedPromise)
    }
  })()
  promises.add(trackedPromise)
}

export const startWorkerJavascriptCoverage = async (
  page: Page,
  targetScript: string,
): Promise<WorkerJavascriptCoverage> => {
  const session: CDPSession = await page.context().newCDPSession(page)
  const sessions = new Set<string>()
  const tasks = new Set<Promise<void>>()
  const entries = new Map<string, JavascriptCoverageEntry>()
  const pendingEntries = new Set<Promise<void>>()
  const timers = new Map<string, NodeJS.Timeout>()
  const pendingCommands = new Map<
    number,
    { reject: (error: Error) => void; resolve: (value: any) => void; sessionId: string }
  >()
  let commandId = 0
  let collectionError: Error | undefined
  let stopped = false

  const recordCollectionError = (error: unknown): void => {
    const message = error instanceof Error ? error.message : String(error)
    if (!message.includes('No session with given id') && !message.includes('Target closed')) {
      collectionError = error instanceof Error ? error : new Error(message)
    }
  }

  const getCollectionError = (): Error | undefined => collectionError

  const onReceivedMessage = ({ message }: { readonly message: string }): void => {
    const response = JSON.parse(message) as { error?: { message: string }; id?: number; result?: any }
    if (response.id === undefined) {
      return
    }
    const pending = pendingCommands.get(response.id)
    if (!pending) {
      return
    }
    pendingCommands.delete(response.id)
    if (response.error) {
      pending.reject(new Error(response.error.message))
    } else {
      pending.resolve(response.result)
    }
  }

  const sendToTarget = (sessionId: string, method: string, params: object = {}): Promise<any> => {
    const id = ++commandId
    const command = new Promise<any>((resolve, reject) => {
      pendingCommands.set(id, { reject, resolve, sessionId })
    })
    void session
      .send('Target.sendMessageToTarget', {
        message: JSON.stringify({ id, method, params }),
        sessionId,
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error)
        const pending = pendingCommands.get(id)
        pendingCommands.delete(id)
        pending?.reject(new Error(message))
      })
    return command
  }

  const handleAttachedTarget = async ({ sessionId, targetInfo }: AttachedTarget): Promise<void> => {
    const matches = targetInfo.type === 'worker' && targetInfo.url.includes(targetScript)
    if (matches) {
      sessions.add(sessionId)
      await sendToTarget(sessionId, 'Debugger.enable')
      await sendToTarget(sessionId, 'Profiler.enable')
      await sendToTarget(sessionId, 'Profiler.startPreciseCoverage', { callCount: true, detailed: true })
      if (!stopped && sessions.has(sessionId)) {
        const timer = setInterval(() => {
          trackPromise(pendingEntries, readTargetCoverage(sendToTarget, sessionId, entries), (error) => {
            recordCollectionError(error)
          })
        }, 50)
        timers.set(sessionId, timer)
      }
    }
    await sendToTarget(sessionId, 'Runtime.runIfWaitingForDebugger')
    if (matches) {
      await readTargetCoverage(sendToTarget, sessionId, entries)
    }
  }

  const onAttached = (target: AttachedTarget): void => {
    trackPromise(tasks, handleAttachedTarget(target), async (error: unknown) => {
      recordCollectionError(error)
      const message = error instanceof Error ? error.message : String(error)
      if (message.includes('No session with given id') || message.includes('Target closed')) {
        return
      }
      try {
        await sendToTarget(target.sessionId, 'Runtime.runIfWaitingForDebugger')
      } catch {
        // The target may have closed before it could be resumed.
      }
    })
  }

  const onDetached = ({ sessionId }: { readonly sessionId: string }): void => {
    for (const [id, pending] of pendingCommands) {
      if (pending.sessionId === sessionId) {
        pendingCommands.delete(id)
        pending.reject(new Error('Target closed'))
      }
    }
    sessions.delete(sessionId)
    const timer = timers.get(sessionId)
    if (timer) {
      clearInterval(timer)
      timers.delete(sessionId)
    }
  }

  session.on('Target.attachedToTarget', onAttached)
  session.on('Target.detachedFromTarget', onDetached)
  session.on('Target.receivedMessageFromTarget', onReceivedMessage)
  await session.send('Target.setAutoAttach', { autoAttach: true, flatten: false, waitForDebuggerOnStart: true })

  return {
    async stop(): Promise<readonly JavascriptCoverageEntry[]> {
      if (stopped) {
        return entries.values().toArray()
      }
      stopped = true
      session.off('Target.attachedToTarget', onAttached)
      try {
        for (const timer of timers.values()) {
          clearInterval(timer)
        }
        timers.clear()
        while (tasks.size > 0) {
          await Promise.all(tasks)
        }
        await Promise.all(pendingEntries)
        const firstCollectionError = getCollectionError()
        if (firstCollectionError) {
          throw new Error(firstCollectionError.message, { cause: firstCollectionError })
        }
        for (const sessionId of sessions) {
          trackPromise(pendingEntries, readTargetCoverage(sendToTarget, sessionId, entries), (error) => {
            recordCollectionError(error)
          })
        }
        await Promise.all(pendingEntries)
        const finalCollectionError = getCollectionError()
        if (finalCollectionError) {
          throw new Error(finalCollectionError.message, { cause: finalCollectionError })
        }
        for (const sessionId of sessions) {
          try {
            await sendToTarget(sessionId, 'Profiler.stopPreciseCoverage')
          } catch {
            // A target can exit after its last coverage snapshot.
          }
        }
        const result = entries.values().toArray()
        if (result.length === 0) {
          throw new Error(
            `[test-with-playwright] no JavaScript coverage was collected for worker target ${targetScript}`,
          )
        }
        return result
      } finally {
        try {
          // Disabling auto-attach detaches worker sessions, so finish all coverage commands first.
          await session.send('Target.setAutoAttach', {
            autoAttach: false,
            flatten: false,
            waitForDebuggerOnStart: false,
          })
        } finally {
          session.off('Target.detachedFromTarget', onDetached)
          session.off('Target.receivedMessageFromTarget', onReceivedMessage)
          await session.detach()
        }
      }
    },
  }
}

const readTargetCoverage = async (
  sendToTarget: (sessionId: string, method: string, params?: object) => Promise<any>,
  sessionId: string,
  entries: Map<string, JavascriptCoverageEntry>,
): Promise<void> => {
  try {
    const { result } = (await sendToTarget(sessionId, 'Profiler.takePreciseCoverage')) as {
      result: {
        functions: JavascriptCoverageEntry['functions']
        scriptId: string
        url: string
      }[]
    }
    for (const script of result) {
      if (!script.url) {
        continue
      }
      const { scriptSource } = await sendToTarget(sessionId, 'Debugger.getScriptSource', { scriptId: script.scriptId })
      const key = `${sessionId}:${script.scriptId}`
      const previous = entries.get(key)
      const functions = script.functions.map((fn, index) => {
        const previousFunction = previous?.functions[index]
        return {
          functionName: fn.functionName,
          isBlockCoverage: fn.isBlockCoverage,
          ranges: fn.ranges.map((range, rangeIndex) => {
            const previousRange = previousFunction?.ranges[rangeIndex]
            return {
              count: range.count + (previousRange?.count ?? 0),
              endOffset: range.endOffset,
              startOffset: range.startOffset,
            }
          }),
        }
      })
      entries.set(key, {
        functions,
        scriptId: script.scriptId,
        source: previous?.source ?? scriptSource,
        url: script.url,
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (!message.includes('No session with given id') && !message.includes('Target closed')) {
      throw error
    }
  }
}
