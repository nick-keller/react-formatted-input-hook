import { setup } from './setup'

it('should not do anything from the end of the input', async () => {
  const { user, input } = await setup({
    options: { value: 1234 },
    caret: 4,
  })

  await user.keyboard('[Delete]')

  expect(input).toHaveCaret('1234|')
})

it('should delete one character', async () => {
  const { user, input } = await setup({
    options: { value: 1234 },
    caret: 2,
  })

  await user.keyboard('[Delete]')

  expect(input).toHaveCaret('12|4')
})

it('should delete selection', async () => {
  const { user, input } = await setup({
    options: { value: 1234 },
    caret: [1, 3],
  })

  await user.keyboard('[Delete]')

  expect(input).toHaveCaret('1|4')
})

it('should delete reversed selection', async () => {
  const { user, input } = await setup({
    options: { value: 1234 },
    caret: [3, 1],
  })

  await user.keyboard('[Delete]')

  expect(input).toHaveCaret('1|4')
})

it('should not do anything with CMD', async () => {
  const { user, input } = await setup({
    options: { value: 123456 },
    caret: 3,
  })

  await user.keyboard('{Meta>}[Delete]{/Meta}')

  expect(input).toHaveCaret('123|456')
})

it('should not do anything on selection with CMD', async () => {
  const { user, input } = await setup({
    options: { value: 123456 },
    caret: [2, 4],
  })

  await user.keyboard('{Meta>}[Delete]{/Meta}')

  expect(input).toHaveCaret('12|34|56')
})
