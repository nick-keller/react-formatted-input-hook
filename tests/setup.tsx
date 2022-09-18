import {
  NumberInputFormat,
  FormattedNumberInputOptions,
  useFormattedNumberInput,
} from '../src/useFormattedNumberInput'
import userEvent from '@testing-library/user-event'
import { render, screen, act } from '@testing-library/react'

const WrapperComponent = ({
  options,
  setNumberInputFormat,
}: {
  options?: FormattedNumberInputOptions
  setNumberInputFormat?: (nif: NumberInputFormat) => void
}) => {
  const numberInput = useFormattedNumberInput(options)
  setNumberInputFormat?.(numberInput)

  return <input {...numberInput.props} />
}

export const setup = async ({
  focus = true,
  caret,
  options,
}: {
  focus?: boolean
  caret?: number | [number, number]
  options?: FormattedNumberInputOptions
} = {}) => {
  const user = userEvent.setup()
  let numberInputFormat: NumberInputFormat
  const rendered = render(
    <WrapperComponent
      options={options}
      setNumberInputFormat={(nif) => (numberInputFormat = nif)}
    />
  )
  const input = screen.getByRole<HTMLInputElement>('textbox')

  if (focus) {
    await user.click(input)

    if (caret) {
      act(() => {
        numberInputFormat.setCaret(
          typeof caret === 'number' ? caret : caret[0],
          typeof caret === 'number' ? undefined : caret[1]
        )
      })
    }
  }

  return {
    ...rendered,
    user,
    input,
    // @ts-ignore
    numberInputFormat,
  }
}
