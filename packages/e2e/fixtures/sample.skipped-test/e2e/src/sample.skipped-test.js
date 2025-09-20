export const skip = 1

export const name = 'sample.skipped-test'

export const test = async ({ Locator, expect }) => {
  const sideBar = Locator('#SideBar')
  await expect(sideBar).toBeVisible()
}
