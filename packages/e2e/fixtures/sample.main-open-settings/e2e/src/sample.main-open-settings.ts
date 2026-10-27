export const name = 'sample.main-open-settings'

export const test = async ({ expect, Locator, Main }: FixtureContext) => {
  await Main.openUri('settings://')

  await expect(Locator('.Viewlet.Settings')).toBeVisible()
}
