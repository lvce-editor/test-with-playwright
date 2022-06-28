import {
  runWithExtension,
  test,
  expect,
} from '@lvce-editor/test-with-playwright'

test('sample.hello-world', async () => {
  const page = await runWithExtension({})
  const sideBar = page.locator('#SideBar')
  await expect(sideBar).toBeVisible()
})
