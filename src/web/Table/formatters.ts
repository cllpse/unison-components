export const TABLE_CELL_NO_VALUE = "–" as const

// `Intl.*Format` construction is expensive and these formatters run on every cell render, so the
// instances are cached per locale and reused instead of being rebuilt on each call.
const numberFormats = new Map<string, Intl.NumberFormat>()
const dateFormats = new Map<string, Intl.DateTimeFormat>()

const numberFormat = () => {
  const locale = navigator.language
  let format = numberFormats.get(locale)

  if (!format) {
    format = new Intl.NumberFormat(locale)
    numberFormats.set(locale, format)
  }

  return format
}

const dateFormat = () => {
  const locale = navigator.language
  let format = dateFormats.get(locale)

  if (!format) {
    format = new Intl.DateTimeFormat(locale)
    dateFormats.set(locale, format)
  }

  return format
}

export const formatters = {
  number: {
    monospace: true,
    formatter: (value?: number) => {
      if (value == null) return TABLE_CELL_NO_VALUE

      return numberFormat().format(value)
    },
  },

  string: {
    monospace: false,
    formatter: (value?: string) => {
      if (value == null) return TABLE_CELL_NO_VALUE

      return value
    },
  },

  boolean: {
    monospace: true,
    formatter: (value?: boolean) => {
      if (value == null) return TABLE_CELL_NO_VALUE

      return value ? "Yes" : "No"
    },
  },

  datetime: {
    monospace: true,
    formatter: (value?: Date | string) => {
      if (value == null) return TABLE_CELL_NO_VALUE

      return dateFormat().format(typeof value === "string" ? new Date(value) : value)
    },
  },
}
