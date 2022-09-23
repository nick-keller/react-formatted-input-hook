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

it('should limit the number of decimal', async () => {
  const { user, input } = await setup({
    caret: 0,
    options: { value: null, maxDecimals: 2 },
  })

  await user.keyboard('1.2345')

  expect(input).toHaveCaret('1.23|')
})

it('should not limit the number of decimal if not typing at the end', async () => {
  const { user, input } = await setup({
    caret: 3,
    options: { value: 1.23, maxDecimals: 2 },
  })

  await user.keyboard('45')

  expect(input).toHaveCaret('1.245|3')
})
