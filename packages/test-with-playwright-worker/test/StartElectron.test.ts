import { afterEach, expect, jest, test } from '@jest/globals'
import { _electron } from '@playwright/test'
import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { startElectron } from '../src/parts/StartElectron/StartElectron.ts'

const launch = jest.spyOn(_electron, 'launch')
const profiles: string[] = []
afterEach(async () => {
  await Promise.all(profiles.map((profile) => rm(profile, { force: true, recursive: true })))
  profiles.length = 0
  launch.mockReset()
})

const prepareLaunch = (mode: string): any => {
  const controller = new AbortController()
  const page = {}
  const close = jest.fn(async () => {})
  const state = { profile: '' }
  launch.mockImplementation(async (options: any): Promise<any> => {
    state.profile = options.args
      .find((arg: string) => arg.startsWith('--user-data-dir='))
      .slice('--user-data-dir='.length)
    profiles.push(state.profile)
    expect(options.env.XDG_CONFIG_HOME).toBe(join(state.profile, 'config'))
    expect(options.env.XDG_DATA_HOME).toBe(join(state.profile, 'data'))
    expect(options.env.XDG_CACHE_HOME).toBe(join(state.profile, 'cache'))
    expect(options.env.XDG_STATE_HOME).toBe(join(state.profile, 'state'))
    await mkdir(options.env.XDG_CONFIG_HOME, { recursive: true })
    await writeFile(join(options.env.XDG_CONFIG_HOME, 'settings.json'), '{"test":true}')
    if (mode === 'launch failure') throw new Error('launch failed')
    if (mode === 'cancel during launch') controller.abort(new Error('launch cancelled'))
    return {
      close,
      firstWindow: async (): Promise<object> => {
        if (mode === 'first window failure') throw new Error('window failed')
        return page
      },
    }
  })
  const pending = startElectron({
    runtimeOptions: {
      args: [],
      env: { XDG_CONFIG_HOME: '/real/config' },
      executablePath: '/app/lvce',
      type: 'electron',
    },
    signal: controller.signal,
  })
  return { close, controller, page, pending, state }
}

test('keeps settings during the scenario and removes the isolated profile on disposal', async () => {
  const { close, page, pending, state } = prepareLaunch('success')
  const app = await pending
  expect(app.page).toBe(page)
  expect(await readFile(join(state.profile, 'config', 'settings.json'), 'utf8')).toBe('{"test":true}')
  await app[Symbol.asyncDispose]()
  await app[Symbol.asyncDispose]()
  expect(close).toHaveBeenCalledTimes(1)
  await expect(access(state.profile)).rejects.toThrow()
})

test.each(['launch failure', 'first window failure', 'cancel during launch'])(
  '%s cleans the isolated LVCE profile',
  async (mode) => {
    const { close, pending, state } = prepareLaunch(mode)
    await expect(pending).rejects.toThrow()
    expect(close).toHaveBeenCalledTimes(mode === 'launch failure' ? 0 : 1)
    await expect(access(state.profile)).rejects.toThrow()
  },
)

test('disposal awaits cleanup already started by cancellation', async () => {
  const { close, controller, pending, state } = prepareLaunch('success')
  const app = await pending
  const closing = Promise.withResolvers<void>()
  close.mockImplementation(() => closing.promise)
  controller.abort()
  const disposal = app[Symbol.asyncDispose]()
  let settled = false
  const observedDisposal = (async (): Promise<void> => {
    await disposal
    settled = true
  })()
  await Promise.resolve()
  expect(settled).toBe(false)
  closing.resolve()
  await observedDisposal
  expect(close).toHaveBeenCalledTimes(1)
  await expect(access(state.profile)).rejects.toThrow()
})
