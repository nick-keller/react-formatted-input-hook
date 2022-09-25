import { FormattedInputOptions, useFormattedInput } from './useFormattedInput'
import { addThousandSeparator, clamp } from './utils'

export type FormattedNumberInputOptions = Pick<
  FormattedInputOptions,
  'liveUpdate'
> & {
  thousandsSeparator?: string
  decimalSeparator?: string
  decimalSeparatorKeys?: string[]
  scale?: number
  prefix?: string
  suffix?: string
  max?: number
  min?: number
  maxDecimals?: number
  minDecimals?: number
  value?: number | null
  onChange?: (value: { value: number | null; formattedValue: string }) => void
}

const constrainValue = ({
  minDecimals,
  min,
  value,
  max,
  maxDecimals,
}: {
  minDecimals: number
  maxDecimals: number
  value: string
  min: number
  max: number
}) => {
  if (!value || isNaN(Number(value))) {
    return ''
  }

  let [whole, decimals] = String(clamp(Number(value), min, max)).split('.')

  decimals = decimals ?? ''

  if (minDecimals > 0) {
    decimals = decimals.padEnd(minDecimals, '0')
  }

  return whole + (decimals ? '.' + decimals.slice(0, maxDecimals) : '')
}

export const useFormattedNumberInput = ({
  thousandsSeparator = '',
  decimalSeparator = '.',
  decimalSeparatorKeys = ['.', decimalSeparator],
  scale = 0,
  prefix = '',
  suffix = '',
  max = Infinity,
  min = -Infinity,
  maxDecimals = Infinity,
  minDecimals = 0,
  value = null,
  onChange = () => null,
  liveUpdate,
}: FormattedNumberInputOptions = {}) => {
  return useFormattedInput({
    value:
      value === null
        ? ''
        : constrainValue({
            value: String(value),
            min,
            max,
            maxDecimals,
            minDecimals,
          }),
    onKeyDown: ({ key, insert, caret, value }) => {
      if (key.match(/^[0-9]$/)) {
        const decimalsStart = value.indexOf('.')

        // If user types a number after the decimal point
        if (decimalsStart !== -1 && decimalsStart < caret.left) {
          // Do not register keystroke if
          // - cursor is at the end of input
          // - and input already has maximum number of decimals allowed
          if (
            caret.right !== value.length ||
            caret.left - decimalsStart - 1 < maxDecimals
          ) {
            insert(key)
          }
        } else {
          insert(key)
        }
      }

      // Only allow typing minus :
      // - at the start of the input
      // - no minus already present
      // - negative numbers are allowed
      if (
        key === '-' &&
        caret.left === 0 &&
        value[caret.right] !== '-' &&
        min < 0
      ) {
        insert('-')
      }

      if (
        decimalSeparatorKeys.includes(key) &&
        !value.slice(0, caret.left).includes('.') &&
        !value.slice(caret.right).includes('.') &&
        maxDecimals > 0
      ) {
        insert(/[0-9]/.test(value[caret.left - 1] ?? '') ? '.' : '0.')
      }
    },
    format: (value) => {
      const negative = value[0] === '-'
      const [whole, decimals] = value.slice(negative ? 1 : 0).split('.')
      let formatted = addThousandSeparator(whole, thousandsSeparator)

      const mapping = [prefix.length]

      if (negative) {
        mapping.push(prefix.length)
      }

      const offset =
        prefix.length +
        (negative ? 1 : 0) +
        // Number of thousands separator on the whole part
        Math.floor((whole.length - 1) / 3) * thousandsSeparator.length

      for (let i = 0; i < whole.length; i++) {
        mapping.push(
          i +
            offset -
            // number of thousands separator to the right of the cursor
            Math.floor((whole.length - 1 - i) / 3) * thousandsSeparator.length
        )
      }

      if (decimals !== undefined) {
        const offset = prefix.length + (negative ? 1 : 0) + formatted.length
        formatted += decimalSeparator + decimals
        mapping.push(offset)

        for (let i = offset + 1; i <= offset + decimals.length; i++) {
          mapping.push(i)
        }
      }

      return {
        formatted: prefix + (negative ? '-' : '') + formatted + suffix,
        mapping,
      }
    },
    onBlur: (value) =>
      constrainValue({ max, maxDecimals, minDecimals, min, value }),
    onChange: ({ value, formattedValue }) =>
      onChange({
        value:
          value === '' || isNaN(Number(value))
            ? null
            : Math.pow(10, scale) *
              clamp(
                Number(
                  maxDecimals > 0 && maxDecimals !== Infinity
                    ? value.replace(
                        new RegExp(`(\\.[0-9]{0,${maxDecimals}}).*$`),
                        '$1'
                      )
                    : value
                ) + 0,
                min,
                max
              ),
        formattedValue,
      }),
    liveUpdate,
  })
}

export type FormattedNumberInput = ReturnType<typeof useFormattedNumberInput>
