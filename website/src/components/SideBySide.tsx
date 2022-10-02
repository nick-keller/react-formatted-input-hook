import React, { useRef, useState } from 'react'
import { currencyFormatter } from 'react-formatted-input-hook'

const { format, onBlur } = currencyFormatter({
  currency: 'USD',
  locales: 'en-US',
})

export const SideBySide = () => {
  const [value, setValue] = useState('1234.00')
  const [_, reRender] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const { formatted, mapping } = format(value)

  const caretLeft = inputRef.current?.selectionStart ?? -1
  const caretRight = inputRef.current?.selectionEnd ?? -1
  let selectionStart = null
  let selectionEnd = null

  if (inputRef.current === document.activeElement) {
    if (caretLeft === caretRight) {
      selectionStart = caretLeft === 0 ? mapping[0] : mapping[caretLeft] + 1
    } else {
      selectionStart = mapping[caretLeft + 1]
    }

    if (caretLeft === caretRight) {
      selectionEnd = selectionStart
    } else {
      selectionEnd = mapping[caretRight] + 1
    }
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <input
        className="demo"
        ref={inputRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Start typing..."
        style={{ width: '100vw', maxWidth: 250, marginRight: 10 }}
        onBlur={(event) => {
          setValue(onBlur(event.target.value))
          reRender((x) => x + 1)
        }}
        onMouseDown={() => reRender((x) => x + 1)}
        onMouseUp={() => reRender((x) => x + 1)}
        onMouseMove={() => reRender((x) => x + 1)}
        onKeyDown={() => reRender((x) => x + 1)}
        onKeyUp={() => reRender((x) => x + 1)}
      />
      <span className="demo" style={{ width: '100vw', maxWidth: 250 }}>
        {formatted.split('').map((c, i) => (
          <span
            key={i}
            style={{
              boxShadow:
                i === selectionStart && selectionStart === selectionEnd
                  ? '-1px 0 var(--ifm-font-color-base)'
                  : null,
              background:
                selectionStart !== selectionEnd &&
                i >= selectionStart &&
                i < selectionEnd
                  ? 'rgba(127,192,255,0.5)'
                  : null,
            }}
          >
            {c}
          </span>
        ))}
        <span
          style={{
            boxShadow:
              formatted.length === selectionStart &&
              selectionStart === selectionEnd
                ? '-1px 0 var(--ifm-font-color-base)'
                : null,
            paddingLeft: 1,
          }}
        ></span>
      </span>
    </div>
  )
}
