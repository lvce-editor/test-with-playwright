export const name = 'sample.locator-assertions'

export const test = async ({ expect, Locator }) => {
  const sideBar = Locator('.SideBar')
  await expect(sideBar).toBeVisible()
  await expect(sideBar).toHaveCount(1)
  await expect(Locator('.ElementThatDoesNotExist')).toBeHidden()
}
