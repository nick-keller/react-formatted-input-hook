import { setup } from './setup'

test('Left arrow should move to the left', async () => {
  const { user, input } = await setup({
    caret: 3,
    options: { initialValue: 1234 },
  })

  await user.keyboard('[ArrowLeft]')

  expect(input).toHaveCaret('12|34')
})

test('Right arrow should move to the right', async () => {
  const { user, input } = await setup({
    caret: 2,
    options: { initialValue: 1234 },
  })

  await user.keyboard('[ArrowRight]')

  expect(input).toHaveCaret('123|4')
})

test('Left arrow should move to start of selection', async () => {
  const { user, input } = await setup({
    caret: [1, 3],
    options: { initialValue: 1234 },
  })

  await user.keyboard('[ArrowLeft]')

  expect(input).toHaveCaret('1|234')
})

test('Right arrow should move to end of selection', async () => {
  const { user, input } = await setup({
    caret: [1, 3],
    options: { initialValue: 1234 },
  })

  await user.keyboard('[ArrowRight]')

  expect(input).toHaveCaret('123|4')
})

test('Left arrow should move to start of reversed selection', async () => {
  const { user, input } = await setup({
    caret: [3, 1],
    options: { initialValue: 1234 },
  })

  await user.keyboard('[ArrowLeft]')

  expect(input).toHaveCaret('1|234')
})

test('Right arrow should move to end of reversed selection', async () => {
  const { user, input } = await setup({
    caret: [3, 1],
    options: { initialValue: 1234 },
  })

  await user.keyboard('[ArrowRight]')

  expect(input).toHaveCaret('123|4')
})

test('CMD + Left arrow should move to the start', async () => {
  const { user, input } = await setup({
    caret: 3,
    options: { initialValue: 1234 },
  })

  await user.keyboard('{Meta>}[ArrowLeft]{/Meta}')

  expect(input).toHaveCaret('|1234')
})

test('CMD + Right arrow should move to the end', async () => {
  const { user, input } = await setup({
    caret: 2,
    options: { initialValue: 1234 },
  })

  await user.keyboard('{Meta>}[ArrowRight]{/Meta}')

  expect(input).toHaveCaret('1234|')
})

test('Shift + Left arrow should select to the left', async () => {
  const { user, input } = await setup({
    caret: 3,
    options: { initialValue: 1234 },
  })

  await user.keyboard('{Shift>}[ArrowLeft]{/Shift}')

  expect(input).toHaveCaret('12|3|4')
})

test('Shift + Right arrow should select to the right', async () => {
  const { user, input } = await setup({
    caret: 2,
    options: { initialValue: 1234 },
  })

  await user.keyboard('{Shift>}[ArrowRight]{/Shift}')

  expect(input).toHaveCaret('12|3|4')
})

test('Shift + Left arrow should expand selection to the left', async () => {
  const { user, input } = await setup({
    caret: [2, 3],
    options: { initialValue: 1234 },
  })

  await user.keyboard('{Shift>}[ArrowLeft]{/Shift}')

  expect(input).toHaveCaret('1|23|4')
})

test('Shift + Right arrow should shrink selection to the left', async () => {
  const { user, input } = await setup({
    caret: [1, 3],
    options: { initialValue: 1234 },
  })

  await user.keyboard('{Shift>}[ArrowRight]{/Shift}')

  expect(input).toHaveCaret('12|3|4')
})

test('Shift + Left arrow should shrink reversed selection to the right', async () => {
  const { user, input } = await setup({
    caret: [3, 1],
    options: { initialValue: 1234 },
  })

  await user.keyboard('{Shift>}[ArrowLeft]{/Shift}')

  expect(input).toHaveCaret('1|2|34')
})

test('Shift + Right arrow should expand selection to the right', async () => {
  const { user, input } = await setup({
    caret: [2, 1],
    options: { initialValue: 1234 },
  })

  await user.keyboard('{Shift>}[ArrowRight]{/Shift}')

  expect(input).toHaveCaret('1|23|4')
})

test('CMD + Shift + Left arrow should select to the start', async () => {
  const { user, input } = await setup({
    caret: 3,
    options: { initialValue: 1234 },
  })

  await user.keyboard('{Meta>}{Shift>}[ArrowLeft]{/Shift}{/Meta}')

  expect(input).toHaveCaret('|123|4')
})

test('CMD + Shift + Right arrow should select to the end', async () => {
  const { user, input } = await setup({
    caret: 2,
    options: { initialValue: 1234 },
  })

  await user.keyboard('{Meta>}{Shift>}[ArrowRight]{/Shift}{/Meta}')

  expect(input).toHaveCaret('12|34|')
})

test('CMD + Shift + Left arrow should expand selection to the start', async () => {
  const { user, input } = await setup({
    caret: [2, 3],
    options: { initialValue: 1234 },
  })

  await user.keyboard('{Meta>}{Shift>}[ArrowLeft]{/Shift}{/Meta}')

  expect(input).toHaveCaret('|123|4')
})

test('CMD + Shift + Right arrow should expand selection to the end', async () => {
  const { user, input } = await setup({
    caret: [1, 2],
    options: { initialValue: 1234 },
  })

  await user.keyboard('{Meta>}{Shift>}[ArrowRight]{/Shift}{/Meta}')

  expect(input).toHaveCaret('1|234|')
})

test('CMD + Shift + Left arrow should expand reversed selection to the start', async () => {
  const { user, input } = await setup({
    caret: [3, 2],
    options: { initialValue: 1234 },
  })

  await user.keyboard('{Meta>}{Shift>}[ArrowLeft]{/Shift}{/Meta}')

  expect(input).toHaveCaret('|123|4')
})

test('CMD + Shift + Right arrow should expand reversed selection to the end', async () => {
  const { user, input } = await setup({
    caret: [2, 1],
    options: { initialValue: 1234 },
  })

  await user.keyboard('{Meta>}{Shift>}[ArrowRight]{/Shift}{/Meta}')

  expect(input).toHaveCaret('1|234|')
})
