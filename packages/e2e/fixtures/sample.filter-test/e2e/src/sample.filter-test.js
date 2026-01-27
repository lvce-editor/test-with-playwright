export const name = 'sample.filter-test'

export const test = async ({ Locator, expect }) => {
  const sideBar = Locator('#SideBar')
  await expect(sideBar).toBeVisible()
}
