export const name = 'sample.electron'

export const test = async ({ Locator, expect }) => {
  const sideBar = Locator('.SideBar')
  await expect(sideBar).toBeVisible()
}
