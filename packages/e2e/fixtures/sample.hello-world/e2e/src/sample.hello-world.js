test('sample.hello-world', async () => {
  const sideBar = Locator('#SideBar')
  await expect(sideBar).toBeVisible()
})
