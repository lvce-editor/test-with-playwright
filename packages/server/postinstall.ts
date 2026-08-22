import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const staticServerPackagePath = fileURLToPath(import.meta.resolve('@lvce-editor/static-server/package.json'))
const staticServerRoot = dirname(staticServerPackagePath)
const configPath = join(staticServerRoot, 'config.json')
const config = JSON.parse(await readFile(configPath, 'utf8'))
const rendererProcessRoot = join(staticServerRoot, 'static', config.commit, 'packages', 'renderer-process')
const bundlePath = join(rendererProcessRoot, 'dist', 'rendererProcessMain.js')
const rendererProcessPackagePath = join(rendererProcessRoot, 'package.json')

const receiverNeedle = `const handleMessage = event => {
  const actualRequiresSocket = event?.target?.requiresSocket || requiresSocket;`

const receiverReplacement = `const toJsonSafeForE2eCapture = value => {
  const seen = new WeakSet();
  const serialized = JSON.stringify(value, (_key, currentValue) => {
    if (typeof currentValue === 'bigint') {
      return \`${'${currentValue}'}n\`;
    }
    if (typeof currentValue === 'function') {
      return \`[Function ${"${currentValue.name || 'anonymous'}"}]\`;
    }
    if (typeof currentValue === 'symbol') {
      return String(currentValue);
    }
    if (currentValue instanceof Error) {
      return {
        name: currentValue.name,
        message: currentValue.message,
        stack: currentValue.stack
      };
    }
    if (currentValue && typeof currentValue === 'object') {
      if (seen.has(currentValue)) {
        return '[Circular]';
      }
      seen.add(currentValue);
    }
    return currentValue;
  });
  return serialized === undefined ? String(value) : JSON.parse(serialized);
};
const recordReceivedMessageForE2e = message => {
  const receivedMessages = globalThis.___receivedMessages;
  if (!receivedMessages) {
    return;
  }
  let payload;
  try {
    payload = toJsonSafeForE2eCapture(message);
  } catch {
    payload = {
      serializationError: true,
      value: String(message)
    };
  }
  receivedMessages.push({
    sequence: receivedMessages.length,
    wallTime: Date.now(),
    monotonicTime: performance.now(),
    direction: 'renderer-worker->renderer-process',
    type: message?.type || message?.method || message?.[0],
    payload
  });
};
const handleMessage = event => {
  recordReceivedMessageForE2e(event.data);
  const actualRequiresSocket = event?.target?.requiresSocket || requiresSocket;`

const initializeNeedle = `const initialize = search => {
  const searchParams = new URLSearchParams(search);
  state$a.enabled = searchParams.has('traceRendererWorker');
  state$a.entries = [];
};`

const initializeReplacement = `const initialize = search => {
  const searchParams = new URLSearchParams(search);
  state$a.enabled = searchParams.has('traceRendererWorker');
  state$a.entries = [];
  globalThis.___receivedMessages = state$a.enabled ? [] : undefined;
};`

const replaceExactlyOnce = (source: string, needle: string, replacement: string, description: string): string => {
  const occurrences = source.split(needle).length - 1
  if (occurrences !== 1) {
    throw new Error(`Expected exactly one ${description} in renderer-process bundle, found ${occurrences}`)
  }
  return source.replace(needle, replacement)
}

const source = await readFile(bundlePath, 'utf8')
const withReceiverCapture = replaceExactlyOnce(source, receiverNeedle, receiverReplacement, 'message receiver')
const patched = replaceExactlyOnce(withReceiverCapture, initializeNeedle, initializeReplacement, 'trace initializer')
await writeFile(bundlePath, patched)

const rendererProcessPackage = JSON.parse(await readFile(rendererProcessPackagePath, 'utf8'))
console.info(`[e2e diagnostics] patched renderer-process ${rendererProcessPackage.version} at ${bundlePath}`)
