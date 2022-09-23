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

it('should have null value when empty', async () => {
  const onChange = jest.fn()
  const { input } = await setup({
    options: {
      onChange,
    },
    focus: true,
  })

  act(() => {
    input.blur()
  })

  expect(onChange).toHaveBeenCalledWith({ formattedValue: '', value: null })
})

it('should have null value when deleting the last character', async () => {
  const onChange = jest.fn()
  const { user } = await setup({
    options: {
      onChange,
      value: 1,
      liveUpdate: true,
    },
    caret: 1,
  })

  await user.keyboard('[Backspace]')

  expect(onChange).toHaveBeenCalledWith({ formattedValue: '', value: null })
})

it('should have null value when invalid input', async () => {
  const onChange = jest.fn()
  const { input, user } = await setup({
    options: {
      onChange,
    },
    focus: true,
  })

  await user.keyboard('-')

  act(() => {
    input.blur()
  })

  expect(input).toHaveValue('')
  expect(onChange).toHaveBeenCalledWith({ formattedValue: '', value: null })
})

it('should have null value when typing invalid input', async () => {
  const onChange = jest.fn()
  const { input, user } = await setup({
    options: {
      onChange,
      liveUpdate: true,
    },
  })

  await user.keyboard('-')

  expect(onChange).toHaveBeenCalledWith({ formattedValue: '-', value: null })

  act(() => {
    input.blur()
  })

  expect(input).toHaveValue('')
  expect(onChange).toHaveBeenCalledWith({ formattedValue: '', value: null })
})

it('should not call onChange with too many decimals', async () => {
  const onChange = jest.fn()
  const { input, user } = await setup({
    options: {
      onChange,
      maxDecimals: 2,
      value: 1.23,
    },
    caret: 3,
  })

  await user.keyboard('45')

  act(() => {
    input.blur()
  })

  expect(input).toHaveValue('1.24')
  expect(onChange).toHaveBeenCalledWith({ formattedValue: '1.24', value: 1.24 })
})

it('should not call onChange with too many decimals with live update', async () => {
  const onChange = jest.fn()
  const { input, user } = await setup({
    options: {
      onChange,
      maxDecimals: 2,
      value: 1.23,
      liveUpdate: true,
    },
    caret: 3,
  })

  await user.keyboard('4')
  expect(input).toHaveValue('1.243')
  expect(onChange).toHaveBeenCalledWith({
    formattedValue: '1.243',
    value: 1.24,
  })

  await user.keyboard('5')
  expect(input).toHaveValue('1.2453')
  expect(onChange).toHaveBeenCalledWith({
    formattedValue: '1.2453',
    value: 1.24,
  })

  act(() => {
    input.blur()
  })

  expect(input).toHaveValue('1.24')
  expect(onChange).toHaveBeenCalledWith({ formattedValue: '1.24', value: 1.24 })
})
