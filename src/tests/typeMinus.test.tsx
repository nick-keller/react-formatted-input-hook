import { setup } from './setup'

it('should add minus', async () => {
  const { user, input } = await setup({
    caret: 0,
    options: { value: 12 },
  })

  await user.keyboard('-')

  expect(input).toHaveCaret('-|12')
})

it('should not add minus when minimum is zero', async () => {
  const { user, input } = await setup({
    caret: 0,
    options: { value: 12, min: 0 },
  })

  await user.keyboard('-')

  expect(input).toHaveCaret('|12')
})

it('should not add minus when minimum is high', async () => {
  const { user, input } = await setup({
    caret: 0,
    options: { value: 12, min: 99 },
  })

  await user.keyboard('-')

  expect(input).toHaveCaret('|12')
})

it('should not add minus when already has minus', async () => {
  const { user, input } = await setup({
    caret: 0,
    options: { value: -12 },
  })

  await user.keyboard('-')

  expect(input).toHaveCaret('|-12')
})

it('should not add minus when not at the start', async () => {
  const { user, input } = await setup({
    caret: 1,
    options: { value: 12 },
  })

  await user.keyboard('-')

  expect(input).toHaveCaret('1|2')
})

it('should replace selection at start', async () => {
  const { user, input } = await setup({
    caret: [0, 2],
    options: { value: -12 },
  })

  await user.keyboard('-')

  expect(input).toHaveCaret('-|2')
})
