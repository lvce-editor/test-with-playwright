export const name = 'sample.hello-world'

export const test = async ({ Locator, expect }) => {
  const sideBar = Locator('#SideBar')
  await expect(sideBar).toBeVisible()
}
