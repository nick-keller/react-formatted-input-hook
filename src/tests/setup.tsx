import userEvent from '@testing-library/user-event'
import { render, screen, act } from '@testing-library/react'
import {
  FormattedNumberInputOptions,
  FormattedNumberInput,
  useFormattedNumberInput,
} from '../index'
import { useState } from 'react'

const WrapperComponent = ({
  options: { value: defaultValue, onChange, ...options } = {},
  setFormattedNumberInput,
}: {
  options?: FormattedNumberInputOptions
  setFormattedNumberInput?: (fni: FormattedNumberInput) => void
}) => {
  const [value, setValue] = useState(defaultValue)

  const numberInput = useFormattedNumberInput({
    ...options,
    onChange: (arg) => {
      onChange?.(arg)
      setValue(arg.value)
    },
    value,
  })

  if (defaultValue !== value && defaultValue !== undefined) {
    setValue(defaultValue)
  }

  setFormattedNumberInput?.(numberInput)

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
  let formattedNumberInput: FormattedNumberInput
  const { rerender, ...rendered } = render(
    <WrapperComponent
      options={options}
      setFormattedNumberInput={(fni) => (formattedNumberInput = fni)}
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
    rerender: (options: FormattedNumberInputOptions) =>
      rerender(<WrapperComponent options={options} />),
    user,
    input,
    // @ts-ignore
    formattedNumberInput,
  }
}
