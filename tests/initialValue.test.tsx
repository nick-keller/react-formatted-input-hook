import { setup } from './setup'

it('should should have no default initial value', async () => {
  const { input } = await setup()

  expect(input).toHaveValue('')
})

it('should prefill the input with initial value', async () => {
  const { input } = await setup({
    options: {
      initialValue: 123,
    },
  })

  expect(input).toHaveValue('123')
})
