import { useState } from 'react'
import { useFormattedNumberInput } from '../../src'

function App() {
  const [value, setValue] = useState<number | null>(123456)
  const formattedInput = useFormattedNumberInput({
    value,
    minDecimals: 2,
    maxDecimals: 4,
    thousandsSeparator: ',',
    prefix: '$ ',
    suffix: ' %',
    onChange: ({ value }) => setValue(value),
  })

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
