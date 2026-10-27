export const name = 'console.messages'

export const test = async () => {
  console.warn('fixture warning')
  console.error('fixture error')
  setTimeout(() => {
    throw new Error('fixture uncaught page error')
  }, 0)
  await new Promise((resolve) => setTimeout(resolve, 50))
}
