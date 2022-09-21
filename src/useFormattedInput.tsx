import {
  FocusEventHandler,
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { clamp } from './utils'
import {
  FormatFn,
  InsertFn,
  OnKeyDownFn,
  SetCaretFn,
  SetValueFn,
} from './types'

export type FormattedInputOptions = {
  value?: string
  onChange?: (value: { value: string; formattedValue: string }) => void
  onBlur?: (value: string) => string
  onKeyDown?: OnKeyDownFn
  liveUpdate?: boolean
  format?: FormatFn
}

export type InputState = Required<
  Pick<
    FormattedInputOptions,
    'onChange' | 'value' | 'onKeyDown' | 'format' | 'onBlur'
  >
> & {
  caretStart: number
  caretEnd: number
}

const updateDom = (input: HTMLInputElement, state: InputState) => {
  const caretLeft = Math.min(state.caretStart, state.caretEnd)
  const caretRight = Math.max(state.caretStart, state.caretEnd)

  const { formatted, mapping } = state.format(state.value)

  input.value = formatted

  if (input === document.activeElement) {
    if (caretLeft === caretRight) {
      input.selectionStart =
        caretLeft === 0 ? mapping[0] : mapping[caretLeft] + 1
    } else {
      input.selectionStart = mapping[caretLeft + 1]
    }

    if (caretLeft === caretRight) {
      input.selectionEnd = input.selectionStart
    } else {
      input.selectionEnd = mapping[caretRight] + 1
    }
  }
}

const defaultNullFn = () => null
const defaultIdentityFn = (value: string) => value
const defaultFormat: FormatFn = (value) => ({
  formatted: value,
  mapping: [0, ...value.split('').map((_, i) => i)],
})

export const useFormattedInput = ({
  value = '',
  onChange = defaultNullFn,
  onBlur: blurHandler = defaultIdentityFn,
  onKeyDown: keyDownHandler = defaultNullFn,
  liveUpdate = false,
  format = defaultFormat,
}: FormattedInputOptions = {}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const state = useRef<InputState>({
    value,
    onKeyDown: keyDownHandler,
    onBlur: blurHandler,
    onChange,
    format,
    caretStart: 0,
    caretEnd: 0,
  })

  state.current.onKeyDown = keyDownHandler
  state.current.onChange = onChange
  state.current.onBlur = blurHandler
  state.current.format = format

  useEffect(() => {
    if (!inputRef.current) {
      throw new Error('Missing input ref')
    }

    if (inputRef.current !== document.activeElement) {
      state.current.value = value

      updateDom(inputRef.current, state.current)
    }
  }, [value])

  const setCaret = useCallback<SetCaretFn>(
    (start: number, end: number = start) => {
      if (!inputRef.current) {
        throw new Error('Missing input ref')
      }

      state.current.caretStart = clamp(start, 0, state.current.value.length)
      state.current.caretEnd = clamp(end, 0, state.current.value.length)

      updateDom(inputRef.current, state.current)
    },
    []
  )

  const insert = useCallback<InsertFn>(
    (text) => {
      const caretLeft = Math.min(
        state.current.caretStart,
        state.current.caretEnd
      )
      const caretRight = Math.max(
        state.current.caretStart,
        state.current.caretEnd
      )

      state.current.value =
        state.current.value.slice(0, caretLeft) +
        text +
        state.current.value.slice(caretRight)

      setCaret(caretLeft + text.length)
    },
    [setCaret]
  )

  const setValue = useCallback<SetValueFn>(
    (value, caretStart, caretEnd) => {
      state.current.value = value

      setCaret(caretStart, caretEnd)
    },
    [setCaret]
  )

  const onKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(
    (event) => {
      if (!inputRef.current) {
        throw new Error('Missing input ref')
      }

      if (
        event.key === 'Tab' ||
        event.key === 'Enter' ||
        event.key === 'Escape'
      ) {
        // Do nothing, let the browser handle it
        return
      }

      // Do not prevent CMD or CTRL keypress
      if (!event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
      }

      const caretLeft = Math.min(
        state.current.caretStart,
        state.current.caretEnd
      )
      const caretRight = Math.max(
        state.current.caretStart,
        state.current.caretEnd
      )
      const caretLength = caretRight - caretLeft
      const previousValue = state.current.value

      if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()

        setCaret(0, state.current.value.length)
      } else if (event.key === 'Backspace') {
        event.preventDefault()

        if (caretLength !== 0) {
          state.current.value =
            state.current.value.slice(0, caretLeft) +
            state.current.value.slice(caretRight)
          setCaret(caretLeft)
        } else if (event.metaKey) {
          state.current.value = state.current.value.slice(caretLeft)
          setCaret(0)
        } else {
          state.current.value =
            state.current.value.slice(0, Math.max(0, caretLeft - 1)) +
            state.current.value.slice(caretRight)
          setCaret(caretLeft - 1)
        }
      } else if (event.key === 'Delete') {
        event.preventDefault()

        if (caretLength !== 0) {
          state.current.value =
            state.current.value.slice(0, caretLeft) +
            state.current.value.slice(caretRight)
          setCaret(caretLeft)
        } else if (event.metaKey) {
          // Do nothing
        } else {
          state.current.value =
            state.current.value.slice(0, caretLeft) +
            state.current.value.slice(caretRight + 1)
          setCaret(caretLeft)
        }
      } else if (
        (event.key === 'ArrowLeft' || event.key === 'ArrowRight') &&
        !event.metaKey
      ) {
        event.preventDefault()

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
        event.preventDefault()

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
        event.preventDefault()

        if (event.shiftKey) {
          setCaret(state.current.value.length, caretLeft)
        } else {
          setCaret(state.current.value.length)
        }
      } else if (!event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()

        state.current.onKeyDown({
          key: event.key,
          insert,
          setCaret,
          value: state.current.value,
          caret: { left: caretLeft, right: caretRight },
          setValue,
        })
      }

      if (previousValue !== state.current.value && liveUpdate) {
        state.current.onChange({
          value: state.current.value,
          formattedValue: inputRef.current.value,
        })
      }
    },
    [insert, liveUpdate, setCaret, setValue]
  )

  const onFocus = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
    setCaret(0, state.current.value.length)
  }, [setCaret])

  const onBlur = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
    if (!inputRef.current) {
      throw new Error('Missing input ref')
    }

    const previousValue = state.current.value
    state.current.value = state.current.onBlur(previousValue)

    updateDom(inputRef.current, state.current)

    if (previousValue !== state.current.value || !liveUpdate) {
      state.current.onChange({
        value: state.current.value,
        formattedValue: inputRef.current.value,
      })
    }
  }, [liveUpdate])

  return {
    props: {
      ref: inputRef,
      onKeyDown,
      onFocus,
      onBlur,
    },
    setCaret,
    insert,
    setValue,
  }
}

export type FormattedInput = ReturnType<typeof useFormattedInput>
