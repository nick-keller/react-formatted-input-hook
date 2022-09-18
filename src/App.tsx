import { useFormattedNumberInput } from './useFormattedNumberInput'

function App() {
  const formattedInput = useFormattedNumberInput({
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    prefix: '$ ',
    suffix: ' %',
    maxDecimals: 4,
    minDecimals: 0,
    min: 0,
    max: 100,
    scale: -2,
    liveUpdate: true,
    onChange: console.log,
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
