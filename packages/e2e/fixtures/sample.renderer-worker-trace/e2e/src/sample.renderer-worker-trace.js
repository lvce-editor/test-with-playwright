export const name = 'sample.renderer-worker-trace'
export const test = async ({ Locator, expect }) => {
  const sideBar = Locator('.SideBar')
  await expect(sideBar).toBeVisible()
  await sideBar.click()
  await expect(sideBar).toBeVisible()
}
