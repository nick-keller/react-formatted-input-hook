/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useRef, useState } from 'react'
import {
  currencyFormatter,
  intlNumberFormatter,
  useFormattedInput,
  percentFormatter,
  numberFormatter,
  maskFormatter,
  creditCardFormatter,
  NumberFormatterOptions,
} from 'react-formatted-input-hook'
import Select from 'react-select'
import CodeBlock from '@theme/CodeBlock'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'
import Switch from 'rc-switch'
import 'rc-switch/assets/index.css'

type Params = {
  defaultValue?: number
  defaultOptions?: any
  simple?: boolean
}

const MiniNumber = (options: NumberFormatterOptions) => {
  const formattedInput = useFormattedInput(numberFormatter(options))

  return <input className="demo mini" {...formattedInput.props} />
}

const magicInput = (
  formatter: any,
  name: string,
  config: {
    name: string
    type: 'boolean' | 'string' | 'select' | 'number'
    defaultValue?: any
    choices?: string[]
    numberOptions?: NumberFormatterOptions
  }[] = [],
  props = {}
) => {
  return ({ defaultValue, defaultOptions = {}, simple = false }: Params) => {
    const [value, setValue] = useState(defaultValue)
    const [options, setOptions] = useState(defaultOptions)

    const formattedInput = useFormattedInput(
      formatter({
        ...options,
        value,
        onChange: (value) => {
          setValue(value)
        },
      })
    )

    const formattedInputRef = useRef(formattedInput)
    formattedInputRef.current = formattedInput

    useEffect(() => {
      formattedInputRef.current.setCaret(0)
    }, [options])

    return (
      <div>
        {!simple && (
          <div>
            <Tabs>
              <TabItem value="Code">
                <CodeBlock className="language-ts">{`const formattedInput = useFormattedInput(\n  ${name}({\n${Object.entries(
                  options
                )
                  .map(
                    ([option, value]) =>
                      `    ${option}: ${
                        value instanceof RegExp
                          ? String(value)
                          : JSON.stringify(value)
                      },\n`
                  )
                  .join('')}  })\n)`}</CodeBlock>
              </TabItem>
              <TabItem value="Edit">
                <ul className="props-list">
                  {config.map(
                    ({
                      name,
                      type,
                      defaultValue,
                      choices,
                      numberOptions = {},
                    }) => (
                      <li key={name}>
                        <em style={{ paddingRight: 10 }}>
                          <code>{name}:</code>
                        </em>
                        {type === 'boolean' && (
                          <Switch
                            checked={options[name] ?? defaultValue}
                            onChange={(value) =>
                              setOptions((o) => {
                                if (value === defaultValue) {
                                  delete o[name]
                                } else {
                                  o[name] = value
                                }
                                return { ...o }
                              })
                            }
                          />
                        )}
                        {type === 'string' && (
                          <input
                            className="demo mini left"
                            value={options[name] ?? ''}
                            onChange={(event) =>
                              setOptions((o) => {
                                if (event.target.value === defaultValue) {
                                  delete o[name]
                                } else {
                                  o[name] = event.target.value
                                }
                                return { ...o }
                              })
                            }
                          />
                        )}
                        {type === 'select' && (
                          <Select
                            theme={{
                              spacing: {
                                controlHeight: 10,
                                menuGutter: 2,
                                baseUnit: 2,
                              },
                            }}
                            styles={{
                              container: (p) => ({
                                ...p,
                                maxWidth: 150,
                                display: 'inline-block',
                              }),
                              indicatorSeparator: () => ({ display: 'none' }),
                            }}
                            value={{
                              value: options[name],
                              label: options[name],
                            }}
                            onChange={({ value }) =>
                              setOptions((o) => {
                                if (value === defaultValue) {
                                  delete o[name]
                                } else {
                                  o[name] = value
                                }
                                return { ...o }
                              })
                            }
                            options={choices.map((c) => ({
                              label: c,
                              value: c,
                            }))}
                          />
                        )}
                        {type === 'number' && (
                          <MiniNumber
                            value={options[name] ?? null}
                            onChange={(value) =>
                              setOptions((o) => {
                                if (value === defaultValue) {
                                  delete o[name]
                                } else {
                                  o[name] = value
                                }
                                return { ...o }
                              })
                            }
                            {...numberOptions}
                          />
                        )}
                      </li>
                    )
                  )}
                </ul>
              </TabItem>
            </Tabs>
          </div>
        )}
        <div>
          <input className="demo" {...formattedInput.props} {...props} />
          {!simple && (
            <div style={{ marginTop: 10 }}>
              Value:{' '}
              <em>
                <code>{JSON.stringify(value)}</code>
              </em>
            </div>
          )}
        </div>
      </div>
    )
  }
}

export const NumberInput = magicInput(numberFormatter, 'numberFormatter', [
  { name: 'liveUpdate', type: 'boolean', defaultValue: false },
  {
    name: 'decimalSeparator',
    type: 'string',
    defaultValue: '',
  },

  {
    name: 'maxDecimals',
    type: 'number',
    numberOptions: { min: 0, maxDecimals: 0, liveUpdate: true },
    defaultValue: null,
  },
  {
    name: 'minDecimals',
    type: 'number',
    numberOptions: { min: 0, maxDecimals: 0, liveUpdate: true },
    defaultValue: null,
  },
  {
    name: 'scale',
    type: 'number',
    numberOptions: { min: -5, max: 5, maxDecimals: 0, liveUpdate: true },
    defaultValue: null,
  },
  {
    name: 'groupingSeparator',
    type: 'string',
    defaultValue: '',
  },
  {
    name: 'prefix',
    type: 'string',
    defaultValue: '',
  },
  {
    name: 'suffix',
    type: 'string',
    defaultValue: '',
  },
  {
    name: 'max',
    type: 'number',
    numberOptions: { liveUpdate: true },
    defaultValue: null,
  },
  {
    name: 'min',
    type: 'number',
    numberOptions: { liveUpdate: true },
    defaultValue: null,
  },
])
export const IntlNumberInput = magicInput(
  intlNumberFormatter,
  'intlNumberFormatter',
  [
    { name: 'liveUpdate', type: 'boolean', defaultValue: false },
    {
      name: 'maxDecimals',
      type: 'number',
      numberOptions: { min: 0, maxDecimals: 0, liveUpdate: true },
      defaultValue: null,
    },
    {
      name: 'minDecimals',
      type: 'number',
      numberOptions: { min: 0, maxDecimals: 0, liveUpdate: true },
      defaultValue: null,
    },
    {
      name: 'scale',
      type: 'number',
      numberOptions: { min: -5, max: 5, maxDecimals: 0, liveUpdate: true },
      defaultValue: null,
    },
    {
      name: 'locales',
      type: 'select',
      choices: ['fr-FR', 'de-DE', 'en-US', 'en-GB', 'en-IN'],
    },
    {
      name: 'prefix',
      type: 'string',
      defaultValue: '',
    },
    {
      name: 'suffix',
      type: 'string',
      defaultValue: '',
    },
    {
      name: 'max',
      type: 'number',
      numberOptions: { liveUpdate: true },
      defaultValue: null,
    },
    {
      name: 'min',
      type: 'number',
      numberOptions: { liveUpdate: true },
      defaultValue: null,
    },
  ]
)
export const PercentInput = magicInput(percentFormatter, 'percentFormatter', [
  { name: 'liveUpdate', type: 'boolean', defaultValue: false },
  {
    name: 'maxDecimals',
    type: 'number',
    numberOptions: { min: 0, maxDecimals: 0, liveUpdate: true },
    defaultValue: null,
  },
  {
    name: 'minDecimals',
    type: 'number',
    numberOptions: { min: 0, maxDecimals: 0, liveUpdate: true },
    defaultValue: null,
  },
  {
    name: 'scale',
    type: 'number',
    numberOptions: { min: -5, max: 5, maxDecimals: 0, liveUpdate: true },
    defaultValue: null,
  },
  {
    name: 'locales',
    type: 'select',
    choices: ['fr-FR', 'de-DE', 'en-US', 'en-GB', 'en-IN'],
  },
  {
    name: 'max',
    type: 'number',
    numberOptions: { liveUpdate: true },
    defaultValue: null,
  },
  {
    name: 'min',
    type: 'number',
    numberOptions: { liveUpdate: true },
    defaultValue: null,
  },
])
export const CurrencyInput = magicInput(
  currencyFormatter,
  'currencyFormatter',
  [
    { name: 'liveUpdate', type: 'boolean', defaultValue: false },
    {
      name: 'maxDecimals',
      type: 'number',
      numberOptions: { min: 0, maxDecimals: 0, liveUpdate: true },
      defaultValue: null,
    },
    {
      name: 'scale',
      type: 'number',
      numberOptions: { min: -5, max: 5, maxDecimals: 0, liveUpdate: true },
      defaultValue: null,
    },
    {
      name: 'locales',
      type: 'select',
      choices: ['fr-FR', 'de-DE', 'en-US', 'en-GB', 'en-IN'],
    },
    {
      name: 'currency',
      type: 'select',
      choices: ['USD', 'EUR', 'GBP', 'JPY', 'INR'],
    },
    {
      name: 'max',
      type: 'number',
      numberOptions: { liveUpdate: true },
      defaultValue: null,
    },
    {
      name: 'min',
      type: 'number',
      numberOptions: { liveUpdate: true },
      defaultValue: null,
    },
  ]
)
export const MaskInput = magicInput(
  maskFormatter,
  'maskFormatter',
  [
    { name: 'liveUpdate', type: 'boolean', defaultValue: false },
    { name: 'allowOverflow', type: 'boolean', defaultValue: false },
    {
      name: 'mask',
      type: 'string',
      defaultValue: '',
    },
    {
      name: 'maskChar',
      type: 'string',
      defaultValue: '',
    },
  ],
  { className: 'demo left' }
)

export const CreditCardInput = magicInput(
  creditCardFormatter,
  'creditCardFormatter',
  [
    { name: 'liveUpdate', type: 'boolean', defaultValue: false },
    { name: 'allowOverflow', type: 'boolean', defaultValue: true },
  ],
  { className: 'demo left', style: { width: '100%' } }
)
