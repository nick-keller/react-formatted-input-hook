import {
  FocusEventHandler,
  KeyboardEventHandler,
  useCallback,
  useRef,
} from 'react'

type InputState = {
  stringValue: string
  caretStart: number
  caretEnd: number
}

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max)
}

const updateDom = (
  input: HTMLInputElement,
  state: InputState,
  {
    prefix,
    suffix,
    thousandsSeparator,
  }: {
    prefix: string
    suffix: string
    thousandsSeparator: string
  }
) => {
  const formattedString = thousandsSeparator
    ? state.stringValue.replace(
        /\d{1,3}(?=(?:\d{3})+(?!\d))/g,
        '$&' + thousandsSeparator
      )
    : state.stringValue
  const caretLeft = Math.min(state.caretStart, state.caretEnd)
  const caretRight = Math.max(state.caretStart, state.caretEnd)
  let offsetLeft: number | null = null
  let offsetRight: number | null = null
  let numbersFound = 0

  for (let i = 0; i <= formattedString.length; i++) {
    if (numbersFound === caretLeft) {
      offsetLeft = caretRight > caretLeft ? i : offsetLeft ?? i
    }

    if (numbersFound === caretRight) {
      offsetRight = offsetRight ?? i
    }

    if ((formattedString[i] ?? '').match(/\d/)) {
      numbersFound++
    }
  }

  input.value = prefix + formattedString + suffix
  input.selectionStart = prefix.length + Number(offsetLeft)
  input.selectionEnd = prefix.length + Number(offsetRight)
}

export type NumberInputFormatOptions = {
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
  initialValue?: number | null
  onChange?: (value: { value: number | null; formattedValue: string }) => void
  liveUpdate?: boolean
}

export const useNumberInputFormat = ({
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
  initialValue = value,
  onChange = () => null,
  liveUpdate = false,
}: NumberInputFormatOptions = {}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const state = useRef<InputState>({
    stringValue: String(initialValue ?? ''),
    caretStart: 0,
    caretEnd: 0,
  })

  const setCaret = useCallback((start: number, end: number = start) => {
    if (!inputRef.current) {
      throw new Error('Missing input ref')
    }

    state.current.caretStart = clamp(start, 0, state.current.stringValue.length)
    state.current.caretEnd = clamp(end, 0, state.current.stringValue.length)

    updateDom(inputRef.current, state.current, {
      prefix,
      suffix,
      thousandsSeparator,
    })
  }, [])

  const onKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(
    (event) => {
      if (!inputRef.current) {
        throw new Error('Missing input ref')
      }

      if (event.key === 'Tab') {
        // Do nothing, let the browser handle it
        return
      }

      event.preventDefault()

      const caretLeft = Math.min(
        state.current.caretStart,
        state.current.caretEnd
      )
      const caretRight = Math.max(
        state.current.caretStart,
        state.current.caretEnd
      )
      const caretLength = caretRight - caretLeft

      if (event.key.match(/^\d$/)) {
        state.current.stringValue =
          state.current.stringValue.slice(0, caretLeft) +
          event.key +
          state.current.stringValue.slice(caretRight)

        setCaret(caretLeft + 1)
      } else if (decimalSeparatorKeys.includes(event.key)) {
        // TODO
      } else if (event.key === '-') {
        // TODO
      } else if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
        setCaret(0, state.current.stringValue.length)
      } else if (event.key === 'Backspace') {
        if (caretLength !== 0) {
          state.current.stringValue =
            state.current.stringValue.slice(0, caretLeft) +
            state.current.stringValue.slice(caretRight)
          setCaret(caretLeft)
        } else if (event.metaKey) {
          state.current.stringValue = state.current.stringValue.slice(caretLeft)
          setCaret(0)
        } else {
          state.current.stringValue =
            state.current.stringValue.slice(0, caretLeft - 1) +
            state.current.stringValue.slice(caretRight)
          setCaret(caretLeft - 1)
        }
      } else if (event.key === 'Delete') {
        if (caretLength !== 0) {
          state.current.stringValue =
            state.current.stringValue.slice(0, caretLeft) +
            state.current.stringValue.slice(caretRight)
          setCaret(caretLeft)
        } else if (event.metaKey) {
          // Do nothing
        } else {
          state.current.stringValue =
            state.current.stringValue.slice(0, caretLeft) +
            state.current.stringValue.slice(caretRight + 1)
          setCaret(caretLeft)
        }
      } else if (
        (event.key === 'ArrowLeft' || event.key === 'ArrowRight') &&
        !event.metaKey
      ) {
        const delta = event.key === 'ArrowLeft' ? -1 : 1

        if (event.shiftKey) {
          setCaret(state.current.caretStart + delta, state.current.caretEnd)
        } else if (state.current.caretStart !== state.current.caretEnd) {
          setCaret(event.key === 'ArrowLeft' ? caretLeft : caretRight)
        } else {
          setCaret(state.current.caretStart + delta)
        }
      } else if (
        event.key === 'Home' ||
        event.key === 'ArrowUp' ||
        (event.key === 'ArrowLeft' && event.metaKey)
      ) {
        if (event.shiftKey) {
          setCaret(0, caretRight)
        } else {
          setCaret(0)
        }
      } else if (
        event.key === 'End' ||
        event.key === 'ArrowDown' ||
        (event.key === 'ArrowRight' && event.metaKey)
      ) {
        if (event.shiftKey) {
          setCaret(state.current.stringValue.length, caretLeft)
        } else {
          setCaret(state.current.stringValue.length)
        }
      }
    },
    []
  )

  const onFocus = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
    setCaret(0, state.current.stringValue.length)
  }, [])

  return {
    props: {
      ref: inputRef,
      onKeyDown,
      onFocus,
    },
    setCaret,
  }
}

export type NumberInputFormat = ReturnType<typeof useNumberInputFormat>
