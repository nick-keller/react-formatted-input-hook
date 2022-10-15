import { setup } from './setup'
import { act } from '@testing-library/react'

it('should have a scale of 0 by default', async () => {
  const { input } = await setup({
    options: { value: 1 },
  })

  expect(input).toHaveValue('1')
})

it('should work with negative scales', async () => {
  const { input } = await setup({
    options: { value: 2, scale: 3 },
  })

  expect(input).toHaveValue('0.002')
})

it('should work with positive scales', async () => {
  const { input } = await setup({
    options: { value: 3.1415, scale: -2 },
  })

  expect(input).toHaveValue('314.15')
})

it('should call onChange with the right value with a positive scale', async () => {
  const onChange = jest.fn()
  const { input, user } = await setup({
    options: {
      onChange,
      scale: 4,
    },
  })

  await user.keyboard('123')

  act(() => {
    input.blur()
  })

  expect(onChange).toHaveBeenCalledWith(1230000, '123')
})

it('should call onChange with the right value with a negative scale', async () => {
  const onChange = jest.fn()
  const { input, user } = await setup({
    options: {
      onChange,
      scale: -2,
    },
  })

  await user.keyboard('33.3')

  act(() => {
    input.blur()
  })

  expect(onChange).toHaveBeenCalledWith(0.333, '33.3')
})
