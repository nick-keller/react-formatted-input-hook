import {
  ClipboardEventHandler,
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { clamp } from './utils'
import {
  FormatFn,
  InsertFn,
  OnKeyDownFn,
  OnPasteFn,
  SetCaretFn,
  SetValueFn,
} from './types'

export type FormattedInputOptions = {
  value?: string
  onChange?: (value: { value: string; formattedValue: string }) => void
  onBlur?: (value: string) => string
  onKeyDown?: OnKeyDownFn
  onPaste?: OnPasteFn
  liveUpdate?: boolean
  format?: FormatFn
}

export type InputState = Required<
  Pick<
    FormattedInputOptions,
    'onChange' | 'value' | 'onKeyDown' | 'format' | 'onBlur' | 'onPaste'
  >
> & {
  caretStart: number
  caretEnd: number
  selectAllOnFocus: boolean
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

const getCursorPosition = (mapping: number[], position: number) => {
  let cursor = 0
  while (
    Math.abs(mapping[cursor] + (!cursor ? 0 : 1) - position) >
    Math.abs((mapping[cursor + 1] ?? Infinity) + 1 - position)
  ) {
    cursor++
  }

  return cursor
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
  onPaste: pasteHandler = defaultNullFn,
  liveUpdate = false,
  format = defaultFormat,
}: FormattedInputOptions = {}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  // Use a ref to manage internal state to minimize re-renders
  const state = useRef<InputState>({
    value,
    onKeyDown: keyDownHandler,
    onBlur: blurHandler,
    onPaste: pasteHandler,
    onChange,
    format,
    caretStart: 0,
    caretEnd: 0,
    selectAllOnFocus: true,
  })

  state.current.onKeyDown = keyDownHandler
  state.current.onChange = onChange
  state.current.onBlur = blurHandler
  state.current.format = format

  // Update DOM when value changes and input is blurred
  useEffect(() => {
    if (!inputRef.current) {
      return
    }

    if (inputRef.current !== document.activeElement) {
      state.current.value = value

      updateDom(inputRef.current, state.current)
    }
  }, [value])

  const setCaret = useCallback<SetCaretFn>(
    (start: number, end: number = start) => {
      if (!inputRef.current) {
        return
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
        return
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

        if (event.metaKey) {
          // Do nothing
        } else if (caretLength !== 0) {
          state.current.value =
            state.current.value.slice(0, caretLeft) +
            state.current.value.slice(caretRight)
          setCaret(caretLeft)
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
    if (state.current.selectAllOnFocus) {
      setCaret(0, state.current.value.length)
    }
  }, [setCaret])

  const onBlur = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
    if (!inputRef.current) {
      return
    }

    state.current.selectAllOnFocus = true

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

  const onMouseDown = useCallback<MouseEventHandler<HTMLInputElement>>(() => {
    // Prevent onFocus from selecting all text
    state.current.selectAllOnFocus = false

    // Wait for the selection to be confirmed
    requestAnimationFrame(() => {
      const { mapping } = state.current.format(state.current.value)

      // Only handle fixed caret, otherwise wait for mouse up
      if (inputRef.current?.selectionStart === inputRef.current?.selectionEnd) {
        setCaret(
          getCursorPosition(mapping, inputRef.current?.selectionStart ?? 0)
        )
      }
    })
  }, [setCaret])

  // On mouse up constrain selection
  useEffect(() => {
    const listener = () => {
      requestAnimationFrame(() => {
        if (document.activeElement === inputRef.current) {
          const { mapping } = state.current.format(state.current.value)

          setCaret(
            getCursorPosition(mapping, inputRef.current?.selectionStart ?? 0),
            getCursorPosition(mapping, inputRef.current?.selectionEnd ?? 0)
          )
        }
      })
    }

    document.addEventListener('mouseup', listener)

    return () => document.removeEventListener('mouseup', listener)
  }, [setCaret])

  const onCopy = useCallback<ClipboardEventHandler<HTMLInputElement>>(
    (event) => {
      event.clipboardData.setData(
        'text/plain',
        state.current.value.slice(
          Math.min(state.current.caretStart, state.current.caretEnd),
          Math.max(state.current.caretStart, state.current.caretEnd)
        )
      )
      event.preventDefault()
    },
    []
  )

  const onCut = useCallback<ClipboardEventHandler<HTMLInputElement>>(
    (event) => {
      const caretLeft = Math.min(
        state.current.caretStart,
        state.current.caretEnd
      )
      const caretRight = Math.max(
        state.current.caretStart,
        state.current.caretEnd
      )

      event.clipboardData.setData(
        'text/plain',
        state.current.value.slice(caretLeft, caretRight)
      )
      event.preventDefault()

      state.current.value =
        state.current.value.slice(0, caretLeft) +
        state.current.value.slice(caretRight)
      setCaret(caretLeft)

      if (caretLeft !== caretRight && liveUpdate) {
        state.current.onChange({
          value: state.current.value,
          formattedValue: inputRef.current?.value ?? '',
        })
      }
    },
    [liveUpdate, setCaret]
  )

  const onPaste = useCallback<ClipboardEventHandler<HTMLInputElement>>(
    (event) => {
      event.preventDefault()

      state.current.onPaste({
        clipboard: event.clipboardData.getData('text/plain'),
        insert,
        setCaret,
        value: state.current.value,
        caret: {
          left: Math.min(state.current.caretStart, state.current.caretEnd),
          right: Math.max(state.current.caretStart, state.current.caretEnd),
        },
        setValue,
      })

      if (liveUpdate) {
        state.current.onChange({
          value: state.current.value,
          formattedValue: inputRef.current?.value ?? '',
        })
      }
    },
    [insert, liveUpdate, setCaret, setValue]
  )

  return {
    props: {
      ref: inputRef,
      onKeyDown,
      onFocus,
      onBlur,
      onMouseDown,
      onCopy,
      onCut,
      onPaste,
    },
    setCaret,
    insert,
    setValue,
  }
}

export type FormattedInput = ReturnType<typeof useFormattedInput>
