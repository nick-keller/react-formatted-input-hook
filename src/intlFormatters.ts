import { numberFormatter, NumberFormatterOptions } from './numberFormatter'

const parseGrouping = (
  str: string
): {
  groupingSeparator: NumberFormatterOptions['groupingSeparator']
  grouping: NumberFormatterOptions['grouping']
} => {
  let r = str.match(/123(.)456/)

  if (r) {
    return {
      groupingSeparator: r[1],
      grouping: 'thousand',
    }
  }

  r = str.match(/1(.)23(.)456/)

  if (r) {
    return {
      groupingSeparator: r[1],
      grouping: 'lakh',
    }
  }

  r = str.match(/12(.)3456/)

  if (r) {
    return {
      groupingSeparator: r[1],
      grouping: 'wan',
    }
  }

  return {
    groupingSeparator: undefined,
    grouping: undefined,
  }
}

export const intlNumberFormatter = ({
  locales,
  ...rest
}: Pick<
  NumberFormatterOptions,
  | 'min'
  | 'max'
  | 'minDecimals'
  | 'maxDecimals'
  | 'liveUpdate'
  | 'onChange'
  | 'value'
  | 'scale'
  | 'prefix'
  | 'suffix'
> & {
  locales?: string | string[]
}) => {
  const formatted = new Intl.NumberFormat(locales, {}).format(123456.789)

  const result = formatted.match(
    /(?<whole>1.?2.?3.?4.?5.?6)(?<decimalSeparator>.)789/
  )?.groups as {
    whole: string
    decimalSeparator: string | undefined
  }

  return numberFormatter({
    ...parseGrouping(result.whole),
    decimalSeparator: result.decimalSeparator,
    ...rest,
  })
}

export const currencyFormatter = ({
  currency,
  locales,
  maxDecimals = Infinity,
  ...rest
}: Pick<
  NumberFormatterOptions,
  'min' | 'max' | 'maxDecimals' | 'liveUpdate' | 'onChange' | 'value' | 'scale'
> & {
  currency: string
  locales?: string | string[]
}) => {
  const formatted = new Intl.NumberFormat(locales, {
    style: 'currency',
    currency,
  }).format(123456)

  const result = formatted.match(
    /(?<prefix>.*)(?<whole>1.?2.?3.?4.?5.?6)(?:(?<decimalSeparator>.)(?<minDecimals>0+))?(?<suffix>.*)/
  )?.groups as {
    prefix: string
    whole: string
    decimalSeparator: string | undefined
    minDecimals: string | undefined
    suffix: string
  }

  return numberFormatter({
    prefix: result.prefix,
    suffix: result.suffix,
    decimalSeparator: result.decimalSeparator,
    minDecimals: Math.min(result.minDecimals?.length ?? 0, maxDecimals),
    maxDecimals: result.minDecimals ? maxDecimals : 0,
    ...parseGrouping(result.whole),
    ...rest,
  })
}

export const percentFormatter = ({
  locales,
  min = 0,
  max = 100,
  scale = -2,
  ...rest
}: Pick<
  NumberFormatterOptions,
  | 'min'
  | 'max'
  | 'maxDecimals'
  | 'liveUpdate'
  | 'onChange'
  | 'value'
  | 'minDecimals'
  | 'scale'
> & {
  locales?: string | string[]
}) => {
  const formatted = new Intl.NumberFormat(locales, {
    style: 'percent',
    maximumFractionDigits: 2,
  }).format(0.1234)

  const result = formatted.match(
    /(?<prefix>.*)12(?<decimalSeparator>.)34(?<suffix>.*)/
  )?.groups as {
    prefix: string
    decimalSeparator: string
    suffix: string
  }

  return numberFormatter({
    prefix: result.prefix,
    suffix: result.suffix,
    decimalSeparator: result.decimalSeparator,
    min,
    max,
    scale,
    ...rest,
  })
}
