import { setup } from './setup'

it('should type decimal at caret', async () => {
  const { user, input } = await setup({
    options: { value: 1234 },
    caret: 2,
  })

  await user.keyboard('.')

  expect(input).toHaveCaret('12.|34')
})

it('should support custom decimal separator automatically', async () => {
  const { user, input } = await setup({
    options: { value: 1234, decimalSeparator: ',' },
    caret: 2,
  })

  await user.keyboard(',')

  expect(input).toHaveCaret('12,|34')
})

it('should replace selection', async () => {
  const { user, input } = await setup({
    caret: [1, 3],
    options: { value: 1234 },
  })

  await user.keyboard('.')

  expect(input).toHaveCaret('1.|4')
})

it('should replace reversed selection', async () => {
  const { user, input } = await setup({
    caret: [3, 1],
    options: { value: 1234 },
  })

  await user.keyboard('.')

  expect(input).toHaveCaret('1.|4')
})

it('should not be able to type decimal if maxDecimals is zero', async () => {
  const { user, input } = await setup({
    caret: 2,
    options: { value: 1234, maxDecimals: 0 },
  })

  await user.keyboard('.')

  expect(input).toHaveCaret('12|34')
})

it('should not be able to type decimal if it already has a decimal after', async () => {
  const { user, input } = await setup({
    caret: 2,
    options: { value: 12.34 },
  })

  await user.keyboard('.')

  expect(input).toHaveCaret('12|.34')
})

it('should not be able to type decimal if it already has a decimal before', async () => {
  const { user, input } = await setup({
    caret: 3,
    options: { value: 12.34 },
  })

  await user.keyboard('.')

  expect(input).toHaveCaret('12.|34')
})

it('should be able to type decimal if it already has a decimal at end of selection', async () => {
  const { user, input } = await setup({
    caret: [1, 3],
    options: { value: 12.34 },
  })

  await user.keyboard('.')

  expect(input).toHaveCaret('1.|34')
})

it('should be able to type decimal if it already has a decimal at start of selection', async () => {
  const { user, input } = await setup({
    caret: [2, 4],
    options: { value: 12.34 },
  })

  await user.keyboard('.')

  expect(input).toHaveCaret('12.|4')
})

it('should be able to type decimal if it already has a decimal as selection', async () => {
  const { user, input } = await setup({
    caret: [2, 3],
    options: { value: 12.34 },
  })

  await user.keyboard('.')

  expect(input).toHaveCaret('12.|34')
})

it('should insert zero when typing decimal at the start', async () => {
  const { user, input } = await setup({
    caret: 0,
    options: { value: 1234 },
  })

  await user.keyboard('.')

  expect(input).toHaveCaret('0.|1234')
})

it('should insert zero when typing decimal after minus', async () => {
  const { user, input } = await setup({
    caret: 0,
    options: { value: 1234 },
  })

  await user.keyboard('-.')

  expect(input).toHaveCaret('-0.|1234')
})
