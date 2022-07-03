const testCommand = {
  id: 'test-command',
  async execute() {
    const binaryPath = vscode.getConfiguration('test.binary-path')
    console.log({ binaryPath })
  },
}

export const activate = () => {
  vscode.registerCommand(testCommand)
}
