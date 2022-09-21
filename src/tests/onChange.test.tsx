import { setup } from './setup'
import { act } from '@testing-library/react'

it('should not call onChange on first render', async () => {
  const onChange = jest.fn()
  await setup({
    options: {
      onChange,
    },
    focus: false,
  })

  expect(onChange).not.toHaveBeenCalled()
})

it('should call onChange on blur by default', async () => {
  const onChange = jest.fn()
  const { input, user } = await setup({
    options: {
      onChange,
      suffix: ' %',
    },
  })

  await user.keyboard('123')

  expect(onChange).not.toHaveBeenCalled()

  act(() => {
    input.blur()
  })

  expect(onChange).toHaveBeenCalledWith({ formattedValue: '123 %', value: 123 })
})

it('should call onChange on each stroke', async () => {
  const onChange = jest.fn()
  const { input, user } = await setup({
    options: {
      onChange,
      prefix: '$ ',
      liveUpdate: true,
    },
  })

  await user.keyboard('1')

  expect(onChange).toHaveBeenCalledWith({ formattedValue: '$ 1', value: 1 })
  onChange.mockClear()

  await user.keyboard('2')

  expect(onChange).toHaveBeenCalledWith({ formattedValue: '$ 12', value: 12 })
  onChange.mockClear()

  act(() => {
    input.blur()
  })

  expect(onChange).not.toHaveBeenCalled()
})

it('should call onChange on blur if it changes', async () => {
  const onChange = jest.fn()
  const { input, user } = await setup({
    options: {
      onChange,
      minDecimals: 2,
      liveUpdate: true,
    },
  })

  await user.keyboard('12')
  expect(onChange).toHaveBeenCalledWith({ formattedValue: '12', value: 12 })

  act(() => {
    input.blur()
  })

  expect(onChange).toHaveBeenCalledWith({ formattedValue: '12.00', value: 12 })
})
