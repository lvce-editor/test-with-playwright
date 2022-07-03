import {
  runWithExtension,
  test,
  expect,
  createFakeBinary,
  writeSettings,
} from '@lvce-editor/test-with-playwright'

test('sample.create-fake-binary', async () => {
  const binaryPath = await createFakeBinary('process.send("ok")')
  console.log({ binaryPath })
  const configDir = await writeSettings({ 'test.binaryPath': binaryPath })
  const page = await runWithExtension({
    env: {
      XDG_CONFIG_HOME: configDir,
    },
  })
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(100)
  await page.keyboard.press('Control+Shift+P')

  const quickPickInput = page.locator('#QuickPick input')
  await expect(quickPickInput).toBeVisible()
  await expect(quickPickInput).toBeFocused()
  await expect(quickPickInput).toHaveValue('>')

  await quickPickInput.type('test command', { delay: 1 })

  const testCommand = page.locator('.QuickPickItem', {
    hasText: 'Test Command',
  })
  await testCommand.click()
})
