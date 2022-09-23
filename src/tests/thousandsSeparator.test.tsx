import { setup } from './setup'

it('should not have a separator by default', async () => {
  const { input } = await setup({
    options: {
      value: 1234,
    },
  })

  expect(input).toHaveValue('1234')
})

it('should show separator', async () => {
  const { input } = await setup({
    options: {
      value: 1234567,
      thousandsSeparator: ',',
    },
  })

  expect(input).toHaveValue('1,234,567')
})

it('should correctly place caret', async () => {
  const { input, formattedNumberInput } = await setup({
    options: {
      value: 1234567,
      thousandsSeparator: ',',
    },
  })

  formattedNumberInput.setCaret(0)
  expect(input).toHaveCaret('|1,234,567')

  formattedNumberInput.setCaret(1)
  expect(input).toHaveCaret('1|,234,567')

  formattedNumberInput.setCaret(2)
  expect(input).toHaveCaret('1,2|34,567')

  formattedNumberInput.setCaret(3)
  expect(input).toHaveCaret('1,23|4,567')

  formattedNumberInput.setCaret(4)
  expect(input).toHaveCaret('1,234|,567')

  formattedNumberInput.setCaret(5)
  expect(input).toHaveCaret('1,234,5|67')

  formattedNumberInput.setCaret(6)
  expect(input).toHaveCaret('1,234,56|7')

  formattedNumberInput.setCaret(7)
  expect(input).toHaveCaret('1,234,567|')
})

it('should correctly place caret with minus', async () => {
  const { input, formattedNumberInput } = await setup({
    options: {
      value: -1234567,
      thousandsSeparator: ',',
    },
  })

  formattedNumberInput.setCaret(0)
  expect(input).toHaveCaret('|-1,234,567')

  formattedNumberInput.setCaret(1)
  expect(input).toHaveCaret('-|1,234,567')

  formattedNumberInput.setCaret(2)
  expect(input).toHaveCaret('-1|,234,567')

  formattedNumberInput.setCaret(3)
  expect(input).toHaveCaret('-1,2|34,567')

  formattedNumberInput.setCaret(4)
  expect(input).toHaveCaret('-1,23|4,567')

  formattedNumberInput.setCaret(5)
  expect(input).toHaveCaret('-1,234|,567')

  formattedNumberInput.setCaret(6)
  expect(input).toHaveCaret('-1,234,5|67')

  formattedNumberInput.setCaret(7)
  expect(input).toHaveCaret('-1,234,56|7')
})

it('should properly select characters to the right', async () => {
  const { input, formattedNumberInput } = await setup({
    options: {
      value: 1234567,
      thousandsSeparator: ',',
    },
  })

  formattedNumberInput.setCaret(0, 1)
  expect(input).toHaveCaret('|1|,234,567')

  formattedNumberInput.setCaret(0, 2)
  expect(input).toHaveCaret('|1,2|34,567')

  formattedNumberInput.setCaret(0, 4)
  expect(input).toHaveCaret('|1,234|,567')

  formattedNumberInput.setCaret(0, 5)
  expect(input).toHaveCaret('|1,234,5|67')
})

it('should properly select characters to the left', async () => {
  const { input, formattedNumberInput } = await setup({
    options: {
      value: 1234567,
      thousandsSeparator: ',',
    },
  })

  formattedNumberInput.setCaret(6, 7)
  expect(input).toHaveCaret('1,234,56|7|')

  formattedNumberInput.setCaret(5, 7)
  expect(input).toHaveCaret('1,234,5|67|')

  formattedNumberInput.setCaret(4, 7)
  expect(input).toHaveCaret('1,234,|567|')

  formattedNumberInput.setCaret(3, 7)
  expect(input).toHaveCaret('1,23|4,567|')

  formattedNumberInput.setCaret(1, 7)
  expect(input).toHaveCaret('1,|234,567|')
})
