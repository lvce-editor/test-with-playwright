// This function is serialized by Playwright and must not close over module bindings.
export const install = (): void => {
  const limit = 5000
  const payloadLimit = 8192
  const entries: any[] = []
  let sequence = 0
  const channels = new WeakMap<object, number>()
  let nextChannel = 0
  const originalAdd = Object.getOwnPropertyDescriptor(EventTarget.prototype, 'addEventListener')!.value
  const record = (kind: string, data: object): void => {
    const entry = { ...data, kind, sequence: sequence++, timestamp: performance.now() }
    entries[entry.sequence % limit] = entry
  }
  const describe = (target: EventTarget | null): string => {
    if (!(target instanceof Element)) {
      if (!(target instanceof Node)) return 'unknown'
      return `${target.nodeName}:${target.nodeValue || ''}`.slice(0, 200)
    }
    return `${target.tagName}#${target.id}.${target.getAttribute('class') || ''}`.slice(0, 200)
  }
  const serialize = (value: unknown): { payload: string; truncated: boolean } => {
    let truncated = false
    const seen = new WeakSet<object>()
    try {
      const text =
        JSON.stringify(value, (_key, item: unknown) => {
          if (typeof item === 'bigint') return `${item}n`
          if (typeof item === 'string') {
            truncated ||= item.length > 2048
            return item.slice(0, 2048)
          }
          if (typeof item !== 'object' || item === null) return item
          if (seen.has(item)) return '[Circular]'
          seen.add(item)
          if (item instanceof MessagePort) return '[MessagePort]'
          if (item instanceof ArrayBuffer) return `[ArrayBuffer ${item.byteLength}]`
          if (ArrayBuffer.isView(item)) return `[${item.constructor.name} ${item.byteLength}]`
          return item
        }) || ''
      return { payload: text.slice(0, payloadLimit), truncated: truncated || text.length > payloadLimit }
    } catch {
      return { payload: '[Unserializable]', truncated: true }
    }
  }
  const observe = (target: EventTarget): number => {
    const existing = channels.get(target)
    if (existing !== undefined) return existing
    const channel = nextChannel++
    channels.set(target, channel)
    Reflect.apply(originalAdd, target, [
      'message',
      (event: MessageEvent): void => {
        record('rpc-received', { channel, ...serialize(event.data) })
      },
    ])
    return channel
  }
  class EventHooks {
    addEventListener(this: EventTarget, ...args: any[]): unknown {
      if (args[0] === 'message' && (this instanceof MessagePort || this instanceof Worker)) observe(this)
      return Reflect.apply(originalAdd, this, args)
    }
  }
  Object.defineProperty(EventTarget.prototype, 'addEventListener', {
    ...Object.getOwnPropertyDescriptor(EventTarget.prototype, 'addEventListener'),
    value: Object.getOwnPropertyDescriptor(EventHooks.prototype, 'addEventListener')!.value,
  })
  for (const prototype of [MessagePort.prototype, Worker.prototype]) {
    const postDescriptor = Object.getOwnPropertyDescriptor(prototype, 'postMessage')!
    const descriptor = Object.getOwnPropertyDescriptor(prototype, 'onmessage')!
    const originalSet = Object.getOwnPropertyDescriptor(descriptor, 'set')!.value
    class PortHooks {
      postMessage(this: EventTarget, ...args: any[]): unknown {
        const channel = observe(this)
        const data = serialize(args[0])
        const result = Reflect.apply(postDescriptor.value, this, args)
        record('rpc-sent', { channel, ...data })
        return result
      }
      set onmessage(listener: unknown) {
        observe(this as unknown as EventTarget)
        Reflect.apply(originalSet, this, [listener])
      }
    }
    const hookDescriptor = Object.getOwnPropertyDescriptor(PortHooks.prototype, 'onmessage')!
    Object.defineProperties(prototype, {
      onmessage: {
        ...descriptor,
        set: Object.getOwnPropertyDescriptor(hookDescriptor, 'set')!.value,
      },
      postMessage: {
        ...postDescriptor,
        value: Object.getOwnPropertyDescriptor(PortHooks.prototype, 'postMessage')!.value,
      },
    })
  }
  for (const type of [
    'click',
    'input',
    'keydown',
    'keyup',
    'pointerdown',
    'pointerup',
    'pointerover',
    'pointerout',
    'focusin',
    'focusout',
  ]) {
    document.addEventListener(
      type,
      (event): void => {
        record('input', {
          event: type,
          key: (event as KeyboardEvent).key,
          target: describe(event.target),
          trusted: event.isTrusted,
        })
      },
      { capture: true, passive: true },
    )
  }
  const observer = new MutationObserver((mutations) => {
    record('dom-mutation', {
      changes: mutations.slice(0, 10).map((mutation) => ({
        added: [...mutation.addedNodes].slice(0, 2).map(describe),
        addedCount: mutation.addedNodes.length,
        attribute: mutation.attributeName,
        removed: [...mutation.removedNodes].slice(0, 2).map(describe),
        removedCount: mutation.removedNodes.length,
        target: describe(mutation.target),
        type: mutation.type,
        value:
          mutation.attributeName && mutation.target instanceof Element
            ? mutation.target.getAttribute(mutation.attributeName)?.slice(0, 200)
            : undefined,
      })),
      count: mutations.length,
    })
  })
  observer.observe(document, { attributes: true, characterData: true, childList: true, subtree: true })
  Object.defineProperty(globalThis, '__lvceTraceTimeline', {
    value: (): object => {
      const offset = sequence > limit ? sequence % limit : 0
      return {
        dropped: Math.max(0, sequence - limit),
        entries: [...entries.slice(offset), ...entries.slice(0, offset)],
        limit,
        version: 1,
      }
    },
  })
}
