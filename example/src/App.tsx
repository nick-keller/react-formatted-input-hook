import { useState } from 'react'
import { intlNumberFormatter, useFormattedInput } from '../../src'

function App() {
  const [value, setValue] = useState<number | null>(1234)
  const formattedInput = useFormattedInput(
    intlNumberFormatter({
      locales: 'en-US',
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
