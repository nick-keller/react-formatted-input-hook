import { FormattedInputOptions, useFormattedInput } from './useFormattedInput'
import { addThousandSeparator } from './utils'

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
    onKeyDown: (event, { insert, caret, value }) => {
      if (event.key.match(/^[0-9]$/)) {
        let decimalsStart = value.indexOf('.')
        if (decimalsStart !== -1 && decimalsStart < caret.left) {
          if (
            caret.right !== value.length ||
            caret.left - decimalsStart - 1 < maxDecimals
          ) {
            insert(event.key)
          }
        } else {
          insert(event.key)
        }
      }

      if (
        event.key === '-' &&
        value[0] !== '-' &&
        min < 0 &&
        caret.left === 0
      ) {
        insert('-')
      }

      if (
        decimalSeparatorKeys.includes(event.key) &&
        !value.includes('.') &&
        maxDecimals > 0
      ) {
        insert(/[0-9]/.test(value[caret.left - 1] ?? '') ? '.' : '0.')
      }
    },
    format: ({ value, focused }) => {
      // if (!focused) {
      //   const canonicalValue = String(Number(value))
      //   let [whole, decimals] = value.split('.')
      //
      //   decimals = decimals ?? ''
      //
      //   if (!decimals && minDecimals > 0) {
      //     decimals = decimalSeparator
      //   }
      //
      //   if (decimals) {
      //     decimals = decimals.padEnd(minDecimals + 1, '0')
      //   }
      //
      //   return {
      //     formatted:
      //       prefix +
      //       addThousandSeparator(whole, thousandsSeparator) +
      //       decimals +
      //       suffix,
      //     mapping: [],
      //   }
      // }

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
    liveUpdate,
  })
}

export type NumberInputFormat = ReturnType<typeof useFormattedNumberInput>
