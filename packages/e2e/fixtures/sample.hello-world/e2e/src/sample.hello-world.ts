export const name = 'sample.hello-world'

export const test = async ({ Locator, expect }: FixtureContext) => {
  const sideBar = Locator('.SideBar')
  await expect(sideBar).toBeVisible()
}
