import { afterEach, expect, jest, test } from '@jest/globals'
import { chromium, webkit } from '@playwright/test'
import { startBrowser } from '../src/parts/StartBrowser/StartBrowser.ts'

const chromiumLaunch = jest.spyOn(chromium, 'launchPersistentContext')
const webkitLaunch = jest.spyOn(webkit, 'launch')

afterEach(() => {
  chromiumLaunch.mockReset()
  webkitLaunch.mockReset()
})

const prepareLaunch = (mode: string): any => {
  const controller = new AbortController()
  const page = {}
  const close = jest.fn(async () => {})
  const instance = {
    close,
    newPage: async (): Promise<object> => {
      if (mode === 'page failure') throw new Error('page failed')
      if (mode === 'cancel during page') controller.abort(new Error('page cancelled'))
      return page
    },
  }
  chromiumLaunch.mockImplementation(async (directory): Promise<any> => {
    expect(directory).toBe('')
    if (mode === 'cancel during launch') controller.abort(new Error('launch cancelled'))
    return instance
  })
  webkitLaunch.mockResolvedValue(instance as any)
  return { close, controller, instance, page }
}

test('Chromium uses a temporary persistent context and disposes it once', async () => {
  const { close, controller, instance, page } = prepareLaunch('success')
  const launch = await startBrowser({ browser: 'chromium', headless: true, signal: controller.signal })
  expect(launch.browser).toBe(instance)
  expect(launch.page).toBe(page)
  await launch.dispose()
  controller.abort()
  await launch.dispose()
  expect(close).toHaveBeenCalledTimes(1)
})

test('WebKit retains its normal browser launcher', async () => {
  const { controller } = prepareLaunch('success')
  const launch = await startBrowser({ browser: 'webkit', headless: true, signal: controller.signal })
  expect(webkitLaunch).toHaveBeenCalledTimes(1)
  expect(chromiumLaunch).not.toHaveBeenCalled()
  await launch.dispose()
})

test.each(['page failure', 'cancel during page', 'cancel during launch'])('%s closes the browser', async (mode) => {
  const { close, controller } = prepareLaunch(mode)
  await expect(startBrowser({ browser: 'chromium', headless: true, signal: controller.signal })).rejects.toThrow()
  expect(close).toHaveBeenCalledTimes(1)
})

test('an already cancelled launch does not start a browser', async () => {
  const { controller } = prepareLaunch('success')
  controller.abort()
  await expect(startBrowser({ browser: 'chromium', headless: true, signal: controller.signal })).rejects.toThrow()
  expect(chromiumLaunch).not.toHaveBeenCalled()
})

test('disposal awaits cleanup started by cancellation', async () => {
  const { close, controller } = prepareLaunch('success')
  const launch = await startBrowser({ browser: 'chromium', headless: true, signal: controller.signal })
  const closing = Promise.withResolvers<void>()
  close.mockImplementation(() => closing.promise)
  controller.abort()
  let settled = false
  const disposal = (async (): Promise<void> => {
    await launch.dispose()
    settled = true
  })()
  await Promise.resolve()
  expect(settled).toBe(false)
  closing.resolve()
  await disposal
  expect(close).toHaveBeenCalledTimes(1)
})

test('disposal reports a cleanup error after cancellation', async () => {
  const { close, controller } = prepareLaunch('success')
  const launch = await startBrowser({ browser: 'chromium', headless: true, signal: controller.signal })
  close.mockRejectedValue(new Error('close failed'))
  controller.abort()
  await expect(launch.dispose()).rejects.toThrow('close failed')
})
