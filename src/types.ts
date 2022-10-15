import { KeyboardEvent } from 'react'

export type InsertFn = (text: string) => void

export type SetValueFn = (
  value: string,
  caretStart: number,
  caretEnd?: number
) => void

export type SetCaretFn = (start: number, end?: number) => void

export type OnInsertFn = (
  params: Readonly<{
    char: string
    insert: InsertFn
    setCaret: SetCaretFn
    setValue: SetValueFn
    value: string
    caret: { left: number; right: number }
  }>
) => void

export type FormatFn = (value: string) => {
  formatted: string
  mapping: number[]
}
