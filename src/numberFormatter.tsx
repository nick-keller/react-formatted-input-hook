import { FormattedInputOptions } from './useFormattedInput'
import { addGroupingSeparator, clamp } from './utils'

export type NumberFormatterOptions = Pick<
  FormattedInputOptions,
  'liveUpdate'
> & {
  groupingSeparator?: string
  grouping?: 'thousand' | 'wan' | 'lakh'
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
  onChange?: (value: number | null, formattedValue: string) => void
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

  // eslint-disable-next-line prefer-const
  let [whole, decimals] = String(clamp(Number(value), min, max)).split('.')

  decimals = decimals ?? ''

  if (minDecimals > 0) {
    decimals = decimals.padEnd(minDecimals, '0')
  }

  return whole + (decimals ? '.' + decimals.slice(0, maxDecimals) : '')
}

export const numberFormatter = ({
  groupingSeparator = '',
  grouping = 'thousand',
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
}: NumberFormatterOptions = {}): FormattedInputOptions => {
  return {
    value:
      value === null
        ? ''
        : constrainValue({
            value: (Math.pow(10, -scale) * value).toPrecision(15),
            min,
            max,
            maxDecimals,
            minDecimals,
          }),
    onInsert: ({ char, insert, caret, value }) => {
      // Cannot type to the left of minus sign
      if (value[caret.right] === '-') {
        return
      }

      if (char.match(/^[0-9]$/)) {
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
            insert(char)
          }
        } else {
          insert(char)
        }
      }

      // Only allow typing minus :
      // - at the start of the input
      // - negative numbers are allowed
      if (char === '-' && caret.left === 0 && min < 0) {
        insert('-')
      }

      if (
        decimalSeparatorKeys.includes(char) &&
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
      let formatted = addGroupingSeparator(whole, groupingSeparator, grouping)

      const mapping = [prefix.length]

      if (negative) {
        mapping.push(prefix.length)
      }

      const offset =
        prefix.length +
        (negative ? 1 : 0) +
        // Number of thousands separator on the whole part
        Math.floor((whole.length - 1) / 3) * groupingSeparator.length

      for (let i = 0; i < whole.length; i++) {
        mapping.push(
          i +
            offset -
            // number of thousands separator to the right of the cursor
            Math.floor((whole.length - 1 - i) / 3) * groupingSeparator.length
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
    onChange: (value, formattedValue) =>
      onChange(
        value === '' || isNaN(Number(value))
          ? null
          : Number(
              (
                Math.pow(10, scale) *
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
                )
              ).toPrecision(15)
            ),
        formattedValue
      ),
    liveUpdate,
  }
}
