import {
  FocusEventHandler,
  KeyboardEvent,
  KeyboardEventHandler,
  useCallback,
  useRef,
} from 'react'

export type InsertFn = (text: string) => void

export type SetValueFn = (
  value: string,
  caretStart: number,
  caretEnd?: number
) => void

export type SetCaretFn = (start: number, end?: number) => void

export type OnKeyDownFn = (
  event: KeyboardEvent<HTMLInputElement>,
  helpers: Readonly<{
    insert: InsertFn
    setCaret: SetCaretFn
    setValue: SetValueFn
    value: string
    caret: { left: number; right: number }
  }>
) => void

export type FormatFn = (value: { value: string; focused: boolean }) => {
  formatted: string
  mapping: number[]
}

type InputState = {
  value: string
  onKeyDown: OnKeyDownFn
  caretStart: number
  caretEnd: number
  format: FormatFn
}

export type FormattedInputOptions = {
  value?: string
  onChange?: (value: { value: string; formattedValue: string }) => void
  onBlur?: (value: string) => string
  liveUpdate?: boolean
  onKeyDown?: OnKeyDownFn
  format?: FormatFn
}

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max)
}

const updateDom = (
  input: HTMLInputElement,
  state: InputState,
  focused: boolean
) => {
  const caretLeft = Math.min(state.caretStart, state.caretEnd)
  const caretRight = Math.max(state.caretStart, state.caretEnd)

  const { formatted, mapping } = state.format({
    value: state.value,
    focused,
  })

  input.value = formatted

  if (focused) {
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
const defaultFormat: FormatFn = ({ value }) => ({
  formatted: value,
  mapping: [0, ...value.split('').map((_, i) => i)],
})

export const useFormattedInput = ({
  value = '',
  onChange = defaultNullFn,
  onKeyDown: keyDownHandler = defaultNullFn,
  liveUpdate = false,
  format = defaultFormat,
}: FormattedInputOptions = {}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const state = useRef<InputState>({
    value,
    onKeyDown: keyDownHandler,
    format,
    caretStart: 0,
    caretEnd: 0,
  })

  const setCaret = useCallback((start: number, end: number = start) => {
    if (!inputRef.current) {
      throw new Error('Missing input ref')
    }

    state.current.caretStart = clamp(start, 0, state.current.value.length)
    state.current.caretEnd = clamp(end, 0, state.current.value.length)

    updateDom(inputRef.current, state.current, true)
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

      if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
        setCaret(0, state.current.value.length)
      } else if (event.key === 'Backspace') {
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
          setCaret(state.current.value.length, caretLeft)
        } else {
          setCaret(state.current.value.length)
        }
      } else {
        const insert: InsertFn = (text) => {
          state.current.value =
            state.current.value.slice(0, caretLeft) +
            text +
            state.current.value.slice(caretRight)

          setCaret(caretLeft + text.length)
        }
        const setValue: SetValueFn = (value, caretStart, caretEnd) => {
          state.current.value = value

          setCaret(caretStart, caretEnd)
        }

        state.current.onKeyDown(event, {
          insert,
          setCaret,
          value: state.current.value,
          caret: { left: caretLeft, right: caretRight },
          setValue,
        })
      }
    },
    []
  )

  const onFocus = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
    setCaret(0, state.current.value.length)
  }, [])

  const onBlur = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
    if (!inputRef.current) {
      throw new Error('Missing input ref')
    }

    updateDom(inputRef.current, state.current, false)
  }, [])

  return {
    props: {
      ref: inputRef,
      onKeyDown,
      onFocus,
      onBlur,
    },
    setCaret,
  }
}

export type FormattedInput = ReturnType<typeof useFormattedInput>
