import {
  ClipboardEventHandler,
  DragEventHandler,
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { clamp } from './utils'
import { FormatFn, InsertFn, OnInsertFn, SetCaretFn, SetValueFn } from './types'

export type FormattedInputOptions = {
  value?: string
  onChange?: (value: string, formattedValue: string) => void
  onBlur?: (value: string) => string
  onInsert?: OnInsertFn
  liveUpdate?: boolean
  format?: FormatFn
}

type InternalInputState = Required<
  Pick<
    FormattedInputOptions,
    'onChange' | 'value' | 'onInsert' | 'format' | 'onBlur'
  >
> & {
  caretStart: number
  caretEnd: number
}

// A function to render an InternalInputState to an HTMLInputElement
const updateDom = (input: HTMLInputElement, state: InternalInputState) => {
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
  onInsert = defaultNullFn,
  liveUpdate = false,
  format = defaultFormat,
}: FormattedInputOptions = {}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  // Use a ref to manage internal state to minimize re-renders
  const state = useRef<InternalInputState>({
    value,
    onInsert,
    onBlur: blurHandler,
    onChange,
    format,
    caretStart: 0,
    caretEnd: 0,
  })

  // Keep ref in sync with props
  state.current.onInsert = onInsert
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

      const caretLeft = Math.min(
        state.current.caretStart,
        state.current.caretEnd
      )
      const caretRight = Math.max(
        state.current.caretStart,
        state.current.caretEnd
      )
      // const caretLength = caretRight - caretLeft
      // const previousValue = state.current.value

      if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()

        setCaret(0, state.current.value.length)
      } else if (
        (event.key === 'ArrowLeft' || event.key === 'ArrowRight') &&
        !event.metaKey &&
        !event.altKey
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
        (event.key === 'ArrowLeft' && (event.metaKey || event.altKey))
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
        (event.key === 'ArrowRight' && (event.metaKey || event.altKey))
      ) {
        event.preventDefault()

        if (event.shiftKey) {
          setCaret(state.current.value.length, caretLeft)
        } else {
          setCaret(state.current.value.length)
        }
      }
    },
    [setCaret]
  )

  const onFocus = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
    if (
      inputRef.current?.selectionStart === 0 &&
      inputRef.current?.selectionEnd === inputRef.current?.value.length
    ) {
      setCaret(0, state.current.value.length)
    }
  }, [setCaret])

  const onBlur = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
    if (!inputRef.current) {
      return
    }

    const previousValue = state.current.value
    state.current.value = state.current.onBlur(previousValue)

    updateDom(inputRef.current, state.current)

    if (previousValue !== state.current.value || !liveUpdate) {
      state.current.onChange(state.current.value, inputRef.current.value)
    }
  }, [liveUpdate])

  const onMouseDown = useCallback<MouseEventHandler<HTMLInputElement>>(() => {
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

  // On mouse up: constrain selection
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

  useEffect(() => {
    const listener = (event: InputEvent) => {
      event.preventDefault()

      const { mapping } = state.current.format(state.current.value)

      const caretLeft = getCursorPosition(
        mapping,
        inputRef.current?.selectionStart ?? 0
      )
      const caretRight = getCursorPosition(
        mapping,
        inputRef.current?.selectionEnd ?? 0
      )

      state.current.caretStart = caretLeft
      state.current.caretEnd = caretRight
      const caretLength = caretRight - caretLeft
      const previousValue = state.current.value

      const deleteSelection = () => {
        state.current.value =
          state.current.value.slice(0, caretLeft) +
          state.current.value.slice(caretRight)
        setCaret(caretLeft)
      }

      if (
        (event.inputType === 'insertText' ||
          event.inputType === 'insertReplacementText' ||
          event.inputType === 'insertFromDrop' ||
          event.inputType === 'insertFromPaste' ||
          event.inputType === 'insertFromPasteAsQuotation' ||
          event.inputType === 'insertCompositionText') &&
        event.data
      ) {
        for (let i = 0; i < event.data.length; i++) {
          state.current.onInsert({
            value: state.current.value,
            char: event.data[i],
            insert,
            setCaret,
            caret: {
              left: state.current.caretStart,
              right: state.current.caretEnd,
            },
            setValue,
          })
        }

        if (event.inputType === 'insertFromDrop') {
          setCaret(caretLeft, caretLeft + event.data.length)
        }
      } else if (
        event.inputType === 'deleteContentBackward' ||
        event.inputType === 'deleteByDrag' ||
        event.inputType === 'deleteByCut' ||
        event.inputType === 'deleteContent'
      ) {
        if (caretLength !== 0) {
          deleteSelection()
        } else {
          state.current.value =
            state.current.value.slice(0, Math.max(0, caretLeft - 1)) +
            state.current.value.slice(caretRight)
          setCaret(caretLeft - 1)
        }
      } else if (event.inputType === 'deleteContentForward') {
        if (caretLength !== 0) {
          deleteSelection()
        } else {
          state.current.value =
            state.current.value.slice(0, caretLeft) +
            state.current.value.slice(caretRight + 1)
          setCaret(caretLeft)
        }
      } else if (
        event.inputType === 'deleteWordBackward' ||
        event.inputType === 'deleteSoftLineBackward' ||
        event.inputType === 'deleteHardLineBackward'
      ) {
        if (caretLength !== 0) {
          deleteSelection()
        } else {
          state.current.value = state.current.value.slice(caretLeft)
          setCaret(0)
        }
      } else if (
        event.inputType === 'deleteWordForward' ||
        event.inputType === 'deleteSoftLineForward' ||
        event.inputType === 'deleteHardLineForward'
      ) {
        if (caretLength !== 0) {
          deleteSelection()
        } else {
          state.current.value = state.current.value.slice(0, caretLeft)
          setCaret(caretLeft)
        }
      } else if (event.inputType === 'deleteEntireSoftLine') {
        if (caretLength !== 0) {
          deleteSelection()
        } else {
          state.current.value = ''
          setCaret(0)
        }
      }

      if (previousValue !== state.current.value && liveUpdate) {
        state.current.onChange(
          state.current.value,
          inputRef.current?.value ?? ''
        )
      }
    }

    const input = inputRef.current
    input?.addEventListener('beforeinput', listener)

    return () => input?.removeEventListener('beforeinput', listener)
  }, [insert, liveUpdate, setCaret, setValue])

  const onCopy = useCallback<ClipboardEventHandler<HTMLInputElement>>(
    (event) => {
      const { mapping } = state.current.format(state.current.value)

      const caretLeft = getCursorPosition(
        mapping,
        inputRef.current?.selectionStart ?? 0
      )
      const caretRight = getCursorPosition(
        mapping,
        inputRef.current?.selectionEnd ?? 0
      )

      event.clipboardData.setData(
        'text/plain',
        state.current.value.slice(caretLeft, caretRight)
      )
      event.preventDefault()
    },
    []
  )

  const onCut = useCallback<ClipboardEventHandler<HTMLInputElement>>(
    (event) => {
      const { mapping } = state.current.format(state.current.value)

      const caretLeft = getCursorPosition(
        mapping,
        inputRef.current?.selectionStart ?? 0
      )
      const caretRight = getCursorPosition(
        mapping,
        inputRef.current?.selectionEnd ?? 0
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
        state.current.onChange(
          state.current.value,
          inputRef.current?.value ?? ''
        )
      }
    },
    [liveUpdate, setCaret]
  )

  const onDragStart = useCallback<DragEventHandler<HTMLInputElement>>(
    (event) => {
      const { mapping } = state.current.format(state.current.value)

      const caretLeft = getCursorPosition(
        mapping,
        inputRef.current?.selectionStart ?? 0
      )
      const caretRight = getCursorPosition(
        mapping,
        inputRef.current?.selectionEnd ?? 0
      )

      event.dataTransfer.setData(
        'text/plain',
        state.current.value.slice(caretLeft, caretRight)
      )
    },
    []
  )
  //
  // const onPaste = useCallback<ClipboardEventHandler<HTMLInputElement>>(
  //   (event) => {
  //     event.preventDefault()
  //
  //     state.current.onPaste({
  //       clipboard: event.clipboardData.getData('text/plain'),
  //       insert,
  //       setCaret,
  //       value: state.current.value,
  //       caret: {
  //         left: Math.min(state.current.caretStart, state.current.caretEnd),
  //         right: Math.max(state.current.caretStart, state.current.caretEnd),
  //       },
  //       setValue,
  //     })
  //
  //     if (liveUpdate) {
  //       state.current.onChange({
  //         value: state.current.value,
  //         formattedValue: inputRef.current?.value ?? '',
  //       })
  //     }
  //   },
  //   [insert, liveUpdate, setCaret, setValue]
  // )

  return {
    props: {
      ref: inputRef,
      onKeyDown,
      onFocus,
      onBlur,
      onMouseDown,
      onCopy,
      onCut,
      onDragStart,
    },
    setCaret,
    insert,
    setValue,
  }
}

export type FormattedInput = ReturnType<typeof useFormattedInput>
