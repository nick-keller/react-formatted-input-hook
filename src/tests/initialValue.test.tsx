import { setup } from './setup'

it('should have no default initial value', async () => {
  const { input } = await setup({ focus: false })

  expect(input).toHaveValue('')
})

it('should prefill the input with initial value', async () => {
  const { input } = await setup({
    options: {
      value: 123,
    },
    focus: false,
  })

  expect(input).toHaveValue('123')
})

it('should update value when prop changes', async () => {
  const { input, rerender } = await setup({
    options: {
      value: 123,
    },
    focus: false,
  })

  rerender({ value: 456 })

  expect(input).toHaveValue('456')
})

it('should not update value when prop changes while focused', async () => {
  const { input, rerender } = await setup({
    options: {
      value: 123,
    },
    focus: true,
  })

  rerender({ value: 456 })

  expect(input).toHaveValue('123')
})
