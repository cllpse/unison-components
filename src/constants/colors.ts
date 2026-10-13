export const COLORS = {
  currentcolor: "currentColor",
  transparent: "transparent",

  black: "#000000",
  white: "#FFFFFF",

  // purple
  primary: {
    0: "#FFFFFF00",
    brand: "#9225FF",
    900: "#4A00B0",
    800: "#6B12D6",
    700: "#9225FF",
    600: "#A852FF",
    500: "#BD7FFF",
    400: "#D1A3FF",
    300: "#E1C4FF",
    200: "#EEDEFF",
    100: "#F6EFFF",
    50: "#FAF7FF",
  },

  // pink
  secondary: {
    0: "#FFFFFF00",
    brand: "#E93BCC",
    900: "#9E1287",
    800: "#D117B2",
    700: "#E93BCC",
    600: "#EE63D7",
    500: "#F28CE1",
    400: "#F6ACEA",
    300: "#F9CAF1",
    200: "#FCE1F7",
    100: "#FDF1FB",
    50: "#FEF8FD",
  },

  // blue
  tertiary: {
    0: "#FFFFFF00",
    brand: "#39A4EB",
    900: "#1066A0",
    800: "#1587D3",
    700: "#39A4EB",
    600: "#62B7EF",
    500: "#8BC9F3",
    400: "#ABD9F7",
    300: "#C9E6FA",
    200: "#E1F1FC",
    100: "#F0F8FE",
    50: "#F8FCFE",
  },

  // yellow
  tentative: {
    0: "#FFFFFF00",
    brand: "#FFC900",
    900: "#514100",
    800: "#6C5700",
    700: "#8E7200",
    600: "#9E7F00",
    500: "#A48600",
    400: "#BD9E00",
    300: "#D0B900",
    200: "#E0D25D",
    100: "#F1E9B8",
    50: "#F8F4E3",
  },

  // green
  positive: {
    0: "#F1FFF5",
    brand: "#1C8744",
    900: "#004D20",
    800: "#00682A",
    700: "#008737",
    600: "#009645",
    500: "#009E52",
    400: "#00B965",
    300: "#61CE8E",
    200: "#9DDEB6",
    100: "#CEF1D9",
    50: "#E4F8EA",
  },

  // red
  negative: {
    0: "#FFFFFF00",
    brand: "#F94D3F",
    900: "#7E1F02",
    800: "#AA2900",
    700: "#DF2F03",
    600: "#EA4921",
    500: "#E45F3D",
    400: "#F28260",
    300: "#FFA086",
    200: "#FFBDA9",
    100: "#FFDBD1",
    50: "#FFEDE8",
  },

  // gray
  neutral: {
    0: "#FFFFFF00",
    brand: "#1A1A1A",
    900: "#000000",
    800: "#0D0D0D",
    700: "#1A1A1A",
    600: "#808080",
    500: "#969696",
    400: "#BDBDBD",
    300: "#E5E5E5",
    200: "#EDEDED",
    100: "#F5F5F5",
    50: "#F7F7F7",
  },

  // gray surface
  neutralsurface: {
    0: "#FFFFFF00",
    brand: "#FFFFFF",
    900: "#575757",
    800: "#707070",
    700: "#8F8F8F",
    600: "#A6A6A6",
    500: "#BDBDBD",
    400: "#CFCFCF",
    300: "#DEDEDE",
    200: "#E8E8E8",
    100: "#F2F2F2",
    50: "#F7F7F7",
  },

  // text
  text: {
    0: "#FFFFFF00",
    brand: "#FFFFFF",
    900: "#FFFFFF",
    800: "#000000",
    700: "#222222",
    600: "#FFFFFF",
    500: "#BDBDBD",
    400: "#C9C9C9",
    300: "#FFFFFF",
    200: "#FFFFFF",
    100: "#FFFFFF",
    50: "#FFFFFF",
  },
} as const

export type ColorName = keyof typeof COLORS

type PaletteColorName = {
  [K in ColorName]: (typeof COLORS)[K] extends { brand: string } ? K : never
}[ColorName]

export type ColorShade = keyof (typeof COLORS)[PaletteColorName]

export type ColorNameAndShade = {
  [Name in ColorName]: (typeof COLORS)[Name] extends string
    ? Name
    : `${Name & string}-${keyof (typeof COLORS)[Name] & string}`
}[ColorName]
