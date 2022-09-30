export const addGroupingSeparator = (
  value: string,
  groupingSeparator: string,
  grouping: 'thousand' | 'wan' | 'lakh'
) => {
  const regexp = {
    thousand: /\d(?=(?:\d{3})+(?!\d))/g,
    wan: /\d(?=(\d{4})+(?!\d))/g,
    lakh: /\d+?(?=(\d\d)+(\d)(?!\d))(\.\d+)?/g,
  }[grouping]
  return groupingSeparator
    ? value.replace(regexp, '$&' + groupingSeparator)
    : value
}

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max)
}
