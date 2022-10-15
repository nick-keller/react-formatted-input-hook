import userEvent from '@testing-library/user-event'
import { render, screen, act } from '@testing-library/react'
import {
  FormattedInput,
  numberFormatter,
  NumberFormatterOptions,
  useFormattedInput,
} from '../index'
import { useState } from 'react'

const WrapperComponent = ({
  options: { value: defaultValue, onChange, ...options } = {},
  setFormattedInput,
}: {
  options?: NumberFormatterOptions
  setFormattedInput?: (fi: FormattedInput) => void
}) => {
  const [value, setValue] = useState(defaultValue)

  const numberInput = useFormattedInput(
    numberFormatter({
      ...options,
      onChange: (value, formattedValue) => {
        onChange?.(value, formattedValue)
        setValue(value)
      },
      value,
    })
  )

  if (defaultValue !== value && defaultValue !== undefined) {
    setValue(defaultValue)
  }

  setFormattedInput?.(numberInput)

  return <input {...numberInput.props} />
}

export const setup = async ({
  focus = true,
  caret,
  options,
}: {
  focus?: boolean
  caret?: number | [number, number]
  options?: NumberFormatterOptions
} = {}) => {
  const user = userEvent.setup()
  let formattedNumberInput: FormattedInput
  const { rerender, ...rendered } = render(
    <WrapperComponent
      options={options}
      setFormattedInput={(fni) => (formattedNumberInput = fni)}
    />
  )
  const input = screen.getByRole<HTMLInputElement>('textbox')

  if (focus) {
    await user.click(input)

    if (caret !== undefined) {
      act(() => {
        formattedNumberInput.setCaret(
          typeof caret === 'number' ? caret : caret[0],
          typeof caret === 'number' ? undefined : caret[1]
        )
      })
    }
  }

  return {
    ...rendered,
    rerender: (options: NumberFormatterOptions) =>
      rerender(<WrapperComponent options={options} />),
    user,
    input,
    // @ts-ignore
    formattedNumberInput,
  }
}
