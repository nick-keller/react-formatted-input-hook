import { useFormattedNumberInput } from './useFormattedNumberInput'

function App() {
  const formattedInput = useFormattedNumberInput({
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    prefix: '$ ',
    suffix: ' %',
    maxDecimals: 3,
  })

  return (
    <>
      <input />
      <input {...formattedInput.props} />
      <input />
    </>
  )
}

export default App
