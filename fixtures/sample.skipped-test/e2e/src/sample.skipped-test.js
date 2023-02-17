test.skip('sample.skipped-test', async () => {
  const sideBar = Locator('#SideBar')
  await expect(sideBar).toBeVisible()
})
