import { setup } from './setup'

it('should type numbers at the end of the input', async () => {
  const { user, input } = await setup()

  await user.keyboard('123')

  expect(input).toHaveCaret('123|')
})

it('should type numbers at caret', async () => {
  const { user, input } = await setup({
    caret: 2,
    options: { value: 123 },
  })

  await user.keyboard('45')

  expect(input).toHaveCaret('1245|3')
})

it('should replace selection', async () => {
  const { user, input } = await setup({
    caret: [1, 3],
    options: { value: 1234 },
  })

  await user.keyboard('56')

  expect(input).toHaveCaret('156|4')
})

it('should replace reversed selection', async () => {
  const { user, input } = await setup({
    caret: [3, 1],
    options: { value: 1234 },
  })

  await user.keyboard('56')

  expect(input).toHaveCaret('156|4')
})
