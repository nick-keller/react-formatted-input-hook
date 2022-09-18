export const addThousandSeparator = (
  value: string,
  thousandsSeparator: string
) => {
  return thousandsSeparator
    ? value.replace(/\d{1,3}(?=(?:\d{3})+(?!\d))/g, '$&' + thousandsSeparator)
    : value
}

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max)
}
