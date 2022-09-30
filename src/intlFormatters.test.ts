import { currencyFormatter, percentFormatter } from './intlFormatters'

jest.mock('./numberFormatter', () => ({ numberFormatter: (opts: any) => opts }))

describe('currencyFormatter', () => {
  it('should detect lakh grouping', () => {
    expect(currencyFormatter({ currency: 'EUR', locales: 'en-IN' })).toEqual({
      decimalSeparator: '.',
      minDecimals: 2,
      maxDecimals: Infinity,
      prefix: '€',
      suffix: '',
      grouping: 'lakh',
      groupingSeparator: ',',
    })
  })

  it('should detect max decimals', () => {
    expect(currencyFormatter({ currency: 'JPY', locales: 'fr-FR' })).toEqual({
      maxDecimals: 0,
      minDecimals: 0,
      prefix: '',
      suffix: ' JPY',
      grouping: 'thousand',
      groupingSeparator: ' ',
    })
  })

  it('should not be able to increase maxDecimals', () => {
    expect(
      currencyFormatter({ currency: 'JPY', locales: 'fr-FR', maxDecimals: 2 })
    ).toEqual({
      maxDecimals: 0,
      minDecimals: 0,
      prefix: '',
      suffix: ' JPY',
      grouping: 'thousand',
      groupingSeparator: ' ',
    })
  })

  it('should work', () => {
    expect(currencyFormatter({ currency: 'USD', locales: 'de-DE' })).toEqual({
      decimalSeparator: ',',
      minDecimals: 2,
      maxDecimals: Infinity,
      prefix: '',
      suffix: ' $',
      grouping: 'thousand',
      groupingSeparator: '.',
    })
  })

  it('should override max decimals', () => {
    expect(
      currencyFormatter({ currency: 'USD', locales: 'de-DE', maxDecimals: 0 })
    ).toEqual({
      decimalSeparator: ',',
      minDecimals: 0,
      maxDecimals: 0,
      prefix: '',
      suffix: ' $',
      grouping: 'thousand',
      groupingSeparator: '.',
    })
  })
})

describe('percentFormatter', () => {
  it('should work', () => {
    expect(percentFormatter({ locales: 'en-IN' })).toEqual({
      decimalSeparator: '.',
      max: 100,
      min: 0,
      prefix: '',
      scale: -2,
      suffix: '%',
    })
  })

  it('should be able to override scale', () => {
    expect(percentFormatter({ locales: 'fr-FR', scale: 0 })).toEqual({
      decimalSeparator: ',',
      max: 100,
      min: 0,
      prefix: '',
      scale: 0,
      suffix: ' %',
    })
  })

  it('should be able to override min and max', () => {
    expect(percentFormatter({ locales: 'en-US', min: -10, max: 50 })).toEqual({
      decimalSeparator: '.',
      max: 50,
      min: -10,
      prefix: '',
      scale: -2,
      suffix: '%',
    })
  })
})
