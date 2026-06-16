import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'electron.typed-smoke'

export const test: Test = async ({ Locator, expect }) => {
  const sideBar = Locator('.SideBar:not(.SecondarySideBar)')
  await expect(sideBar).toBeVisible()
}
