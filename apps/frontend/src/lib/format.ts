export const formatPrice = (value: number): string =>
  new Intl.NumberFormat("ru-RU").format(value);