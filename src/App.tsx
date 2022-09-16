import { useNumberInputFormat } from './useNumberInputFormat'

function App() {
  const numberInput = useNumberInputFormat({
    prefix: '$ ',
    suffix: ' %',
  })

  return (
    <>
      <input />
      <input {...numberInput.props} />
      <input />
    </>
  )
}

export default App
