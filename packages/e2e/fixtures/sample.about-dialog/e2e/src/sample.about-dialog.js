export const name = 'sample.about-dialog'

export const test = async ({ About, expect, Locator }) => {
  await About.show()

  const dialogContent = Locator('.DialogContent')
  await expect(dialogContent).toBeVisible()
  await expect(dialogContent.locator('.DialogInfoIcon')).toBeVisible()
}
