import { setup } from './setup'

it('should not do anything from the start of the input', async () => {
  const { user, input } = await setup({
    options: { initialValue: 1234 },
    caret: 0,
  })

  await user.keyboard('[Home][Backspace]')

  expect(input).toHaveCaret('|1234')
})
