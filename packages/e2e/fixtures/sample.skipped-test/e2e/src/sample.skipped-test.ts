export const skip = 1

export const name = 'sample.skipped-test'

export const test = async ({ Locator, expect }: FixtureContext) => {
  const sideBar = Locator('.SideBar')
  await expect(sideBar).toBeVisible()
}
