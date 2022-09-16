import { setup } from './setup'

it('should not have a separator by default', async () => {
  const { input } = await setup({
    options: {
      initialValue: 1234,
    },
  })

  expect(input).toHaveValue('1234')
})

it('should show separator', async () => {
  const { input } = await setup({
    options: {
      initialValue: 1234567,
      thousandsSeparator: ',',
    },
  })

  expect(input).toHaveValue('1,234,567')
})
