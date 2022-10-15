import { FormattedInputOptions } from './useFormattedInput'

export type MaskFormatterOptions = Pick<
  FormattedInputOptions,
  'liveUpdate' | 'value' | 'onChange'
> & {
  mask?: string | ((value: string) => string)
  maskChar?: string
  allowedChars?: RegExp
  allowOverflow?: boolean
}

export const maskFormatter = ({
  mask = '',
  maskChar = '#',
  allowedChars = /[a-z0-9]/i,
  allowOverflow = false,
  value = '',
  onChange = () => null,
  liveUpdate,
}: MaskFormatterOptions = {}): FormattedInputOptions => {
  return {
    value: value,
    onInsert: ({ char, insert, caret, value }) => {
      const getMask = typeof mask === 'function' ? mask : () => mask
      const maxLength = (getMask(value).match(new RegExp(maskChar, 'g')) ?? [])
        .length

      if (
        char.match(allowedChars) &&
        (allowOverflow ||
          caret.right !== value.length ||
          caret.left < maxLength)
      ) {
        insert(char)
      }
    },
    format: (value) => {
      const getMask = typeof mask === 'function' ? mask : () => mask

      const firstCharIndex = getMask(value).indexOf(maskChar)
      const lastCharIndex = getMask(value).lastIndexOf(maskChar)
      const middleMask =
        firstCharIndex === -1
          ? ''
          : getMask(value).slice(firstCharIndex, lastCharIndex + 1)

      let cursor = 0
      let formatted = getMask(value).slice(0, firstCharIndex)
      const mapping: number[] = [firstCharIndex]

      for (let i = 0; i < middleMask.length && cursor < value.length; i++) {
        if (middleMask[i] === maskChar) {
          formatted += value[cursor]
          mapping.push(i + firstCharIndex)
          cursor++
        } else {
          formatted += middleMask[i]
        }
      }

      // Add end of mask
      if (formatted.length === lastCharIndex + 1) {
        formatted += getMask(value).slice(lastCharIndex + 1)
      }

      // Add overflow at the end
      const offset = getMask(value).length - cursor

      for (; cursor < value.length; cursor++) {
        formatted += value[cursor]
        mapping.push(cursor + offset)
      }

      return {
        formatted,
        mapping,
      }
    },
    onChange: onChange,
    liveUpdate,
  }
}

export type CreditCardFormattedOptions = Pick<
  MaskFormatterOptions,
  'value' | 'allowOverflow' | 'onChange' | 'liveUpdate'
>

export const creditCardFormatter = ({
  allowOverflow = true,
  ...rest
}: CreditCardFormattedOptions) =>
  maskFormatter({
    allowOverflow,
    mask: (value) => {
      const first6 = value.length > 6 ? Number(value.slice(0, 6)) : 0
      const first3 = value.length > 3 ? Number(value.slice(0, 3)) : 0
      const first2 = value.length > 2 ? Number(value.slice(0, 2)) : 0

      if (first2 === 34 || first2 === 37) {
        return '#### ###### #####'
      }

      if (
        (first6 >= 500000 && first6 <= 509999) ||
        (first6 >= 560000 && first6 <= 589999) ||
        (first6 >= 600000 && first6 <= 699999)
      ) {
        if (value.length > 15) {
          return '#### #### #### #### ###'
        }
        if (value.length > 13) {
          return '#### ###### ####'
        }
        return '#### #### #####'
      }

      if (
        (first3 >= 300 && first3 <= 305) ||
        first3 === 309 ||
        first2 === 36 ||
        (first2 >= 38 && first2 === 39)
      ) {
        return '#### ###### ####'
      }

      if (value[0] === '1') {
        return '#### ##### ######'
      }

      return '#### #### #### ####'
    },
    allowedChars: /[0-9]/,
    ...rest,
  })
