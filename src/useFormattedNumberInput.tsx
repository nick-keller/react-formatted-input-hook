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
    value: value === null ? '' : String(value),
    onKeyDown: ({ key, insert, caret, value }) => {
      if (key.match(/^[0-9]$/)) {
        const decimalsStart = value.indexOf('.')

        if (decimalsStart !== -1 && decimalsStart < caret.left) {
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

      if (key === '-' && value[0] !== '-' && min < 0 && caret.left === 0) {
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
        prefix.length + (negative ? 1 : 0) + Math.floor((whole.length - 1) / 3)

      for (let i = 0; i < whole.length; i++) {
        mapping.push(i + offset - Math.floor((whole.length - 1 - i) / 3))
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
    onBlur: (value) => {
      if (!value || isNaN(Number(value))) {
        return ''
      }

      let [whole, decimals] = String(clamp(Number(value), min, max) + 0).split(
        '.'
      )

      decimals = decimals ?? ''

      if (minDecimals > 0) {
        decimals = decimals.padEnd(minDecimals, '0')
      }

      return whole + (decimals ? '.' + decimals.slice(0, maxDecimals) : '')
    },
    onChange: ({ value, formattedValue }) =>
      onChange({
        value:
          value === '' || isNaN(Number(value))
            ? null
            : Math.pow(10, scale) *
              clamp(
                Number(
                  value.replace(
                    maxDecimals > 0 && maxDecimals !== Infinity
                      ? new RegExp(`(\\.[0-9]{0,${maxDecimals}}).*$`)
                      : '',
                    '$1'
                  )
                ) + 0,
                min,
                max
              ),
        formattedValue,
      }),
    liveUpdate,
  })
}

export type NumberInputFormat = ReturnType<typeof useFormattedNumberInput>
