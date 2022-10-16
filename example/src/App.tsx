import { useEffect, useRef, useState } from 'react'
import {
  intlNumberFormatter,
  useFormattedInput,
  maskFormatter,
  creditCardFormatter,
} from '../../src'

function App() {
  const [x, setX] = useState(null)
  const [value, setValue] = useState<null | number>(null)
  const formattedInput = useFormattedInput(
    intlNumberFormatter({
      locales: 'en-US',
      value,
      onChange: setValue,
      liveUpdate: true,
    })
  )

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const listener = (event) => {
      setX({
        d: event.data,
        it: event.inputType,
        s: [inputRef.current?.selectionStart, inputRef.current?.selectionEnd],
        v: inputRef.current?.value,
      })
    }

    const input = inputRef.current
    input?.addEventListener('beforeinput', listener)

    return () => input?.removeEventListener('beforeinput', listener)
  }, [])

  return (
    <main>
      <pre>{JSON.stringify(x, null, 2)}</pre>
      <input ref={inputRef} />
      <input {...formattedInput.props} />
      <span>Value: {JSON.stringify(value)}</span>
      <input />
    </main>
  )
}

export default App
