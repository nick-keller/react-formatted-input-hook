# react-formatted-input-hook

The best way to build formatted inputs, 
inspired by *react-input-mask*, *react-number-format*, and many others, and improved upon. 

- Low level abstractions to support any formatting use cases
- High level abstractions for common use cases: currency, percent, float, credit-card...
- 100% accessible, supports all keyboard and mouse interactions
- Best UX possible, get both the usability of a standard input, with the formatting added!
- Headless, compatible with any UI library: MUI, Ant...
- Written in Typescript
- Heavily tested

## Why is it better than other mask / format libraries?

Unlike other libraries, `react-formatted-input-hook` is focused on UX,
the user interacts with the input like it would if the input was not formatted.

Because other libraries do not follow this principle, it creates terrible UX: 
- cursor jumps for no reasons, 
- copy-pasting does not work,
- selection is tricky,
- deleting characters does not always work,

All of those issues do not affect `react-formatted-input-hook` because it acts like the input is not formatted while still appearing formatted.

## Get started
Install the dependency:
```
npm i react-formatted-input-hook
```

Start using it:
```tsx
import { useFormattedInput, currencyFormatter } from 'react-formatted-input-hook'

const App = () => {
  const [value, setValue] = useState<number | null>(null)
  
  const formattedInput = useFormattedInput(
    currencyFormatter({
      currency: 'EUR',
      locales: 'fr-FR',
      value,
      onChange: ({ value }) => setValue(value),
    })
  )

  return <input {...formattedInput.props} />
}
```

`useFormattedInput` is the low level abstraction that lets you handle virtually any use case of masking / formatting.
Most of the time you will use a formatter as described bellow.

## Formatters
### numberFormatter

A basic number formatter, takes a `NumberFormatterOptions` as parameter (all keys are optional):
```ts
const formattedInput = useFormattedInput(
  numberFormatter({
    groupingSeparator: ',',
    grouping: 'thousand',
    decimalSeparator: '.',
    decimalSeparatorKeys: ['.'],
    scale: 0,
    prefix: '',
    suffix: '',
    max: Infinity,
    min: -Infinity,
    maxDecimals: Infinity,
    minDecimals: 0,
    liveUpdate: false,
    value,
    onChange: ({ value }) => setValue(value),
  })
)
```

### intlNumberFormatter

Works like `numberFormatter` but takes `locales` instead of `groupingSeparator`, `grouping`, `decimalSeparator`, and `decimalSeparatorKeys` (all keys are optional): 
```ts
const formattedInput = useFormattedInput(
  intlNumberFormatter({
    locales: 'fr-FR',
    scale: 0,
    prefix: '',
    suffix: '',
    max: Infinity,
    min: -Infinity,
    maxDecimals: Infinity,
    minDecimals: 0,
    liveUpdate: false,
    value,
    onChange: ({ value }) => setValue(value),
  })
)
```

### percentFormatter

Properly format percent based on `locales` (all keys are optional):
```ts
const formattedInput = useFormattedInput(
  percentFormatter({
    locales: 'en-US',
    scale: -2,
    max: 100,
    min: 0,
    maxDecimals: Infinity,
    minDecimals: 0,
    liveUpdate: false,
    value,
    onChange: ({ value }) => setValue(value),
  })
)
```

### currencyFormatter

Properly format currencies based on `locales` (only `currency` is required):
```ts
const formattedInput = useFormattedInput(
  currencyFormatter({
    currency: 'EUR',
    locales: 'en-IN',
    scale: -2,
    max: 100,
    min: 0,
    maxDecimals: Infinity,
    liveUpdate: false,
    value,
    onChange: ({ value }) => setValue(value),
  })
)
```

## How does it work?

`useFormattedInput` returns a object with a `props` key that should be spread in the input:
```tsx
const App = () => {
  const formattedInput = useFormattedInput(/*...*/)

  return <input {...formattedInput.props} />
}
```

Because `react-formatted-input-hook` is headless, it works with any library that uses real inputs.

Under the hood it keeps a virtual un-formatted input, which is what the user interacts with, and renders a formatted version of that input to the DOM.