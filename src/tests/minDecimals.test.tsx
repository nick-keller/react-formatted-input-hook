import { setup } from './setup'
import { act } from '@testing-library/react'

it('should pad decimals at initial render', async () => {
  const { input } = await setup({
    options: { value: 1234, minDecimals: 2 },
    focus: false,
  })

  expect(input).toHaveCaret('1234.00')
})

it('should pad decimals on blur', async () => {
  const { user, input } = await setup({
    options: { value: null, minDecimals: 2 },
  })

  await user.keyboard('5')
  expect(input).toHaveCaret('5|')

  act(() => {
    input.blur()
  })

  expect(input).toHaveCaret('5.00')
})
