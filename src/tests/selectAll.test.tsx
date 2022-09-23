import { setup } from './setup'

it('should not select the prefix and suffix', async () => {
  const { user, input } = await setup({
    options: { value: 1234, prefix: '>>', suffix: '<<' },
    caret: 0,
  })

  await user.keyboard('{Meta>}a{/Meta}')

  expect(input).toHaveCaret('>>|1234|<<')
})

it('should select all with Ctrl+A', async () => {
  const { user, input } = await setup({
    options: { value: -56.78, prefix: '>>', suffix: '<<' },
    caret: 0,
  })

  await user.keyboard('{Control>}a{/Control}')

  expect(input).toHaveCaret('>>|-56.78|<<')
})
