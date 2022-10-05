import { useState } from 'react'
import {
  intlNumberFormatter,
  useFormattedInput,
  creditCardFormatter,
} from '../../src'

function App() {
  const [value, setValue] = useState('')
  const formattedInput = useFormattedInput(
    creditCardFormatter({
      value,
      onChange: ({ value }) => setValue(value),
      liveUpdate: true,
    })
  )

  return (
    <main>
      <input />
      <input {...formattedInput.props} />
      <span>Value: {JSON.stringify(value)}</span>
      <input />
    </main>
  )
}

export default App
