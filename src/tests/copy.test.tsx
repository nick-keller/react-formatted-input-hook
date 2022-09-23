import { setup } from './setup'

it('should not copy separator', async () => {
  const { user } = await setup({
    options: {
      value: 1234567,
      thousandsSeparator: ',',
    },
    caret: [1, 5],
  })

  const dataTransfer = await user.copy()

  expect(dataTransfer?.getData('text/plain')).toEqual('2345')
})

it('should copy dot as decimal separator', async () => {
  const { user } = await setup({
    options: {
      value: 123.456,
      decimalSeparator: ',',
    },
    caret: [2, 5],
  })

  const dataTransfer = await user.copy()

  expect(dataTransfer?.getData('text/plain')).toEqual('3.4')
})
