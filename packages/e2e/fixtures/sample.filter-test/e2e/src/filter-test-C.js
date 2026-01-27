export const name = 'filter-test-C'

export const test = async ({ Locator, expect }) => {
  const sideBar = Locator('#SideBar')
  await expect(sideBar).toBeVisible()
}
