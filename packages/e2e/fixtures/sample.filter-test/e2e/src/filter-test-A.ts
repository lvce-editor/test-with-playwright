export const name = 'filter-test-A'

export const test = async ({ Locator, expect }: FixtureContext) => {
  const sideBar = Locator('.SideBar')
  await expect(sideBar).toBeVisible()
}
