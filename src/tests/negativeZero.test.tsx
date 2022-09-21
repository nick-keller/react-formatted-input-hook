import { setup } from './setup'
import { act } from '@testing-library/react'

it('should not call onChange with negative zero on blur', async () => {
  const onChange = jest.fn()
  const { input, user } = await setup({
    options: {
      onChange,
    },
  })

  await user.keyboard('-0')

  expect(onChange).not.toHaveBeenCalled()
  expect(input).toHaveValue('-0')

  act(() => {
    input.blur()
  })

  expect(onChange).toHaveBeenCalledWith({ formattedValue: '0', value: 0 })
  expect(input).toHaveValue('0')
})

it('should not call onChange with negative zero as user types', async () => {
  const onChange = jest.fn()
  const { input, user } = await setup({
    options: {
      onChange,
      liveUpdate: true,
    },
  })

  await user.keyboard('-')

  expect(onChange).toHaveBeenCalledWith({ formattedValue: '-', value: null })
  onChange.mockClear()
  expect(input).toHaveValue('-')

  await user.keyboard('0')

  expect(onChange).toHaveBeenCalledWith({ formattedValue: '-0', value: 0 })
  onChange.mockClear()
  expect(input).toHaveValue('-0')

  act(() => {
    input.blur()
  })

  expect(onChange).toHaveBeenCalledWith({ formattedValue: '0', value: 0 })
  expect(input).toHaveValue('0')
})
