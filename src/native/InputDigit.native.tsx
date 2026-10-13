import { forwardRef } from "react"
import { TextInput, type TextInputProps } from "react-native"
import { FontFeatureStyle } from "../utilities/FigmaPropertyHelpers"

export default forwardRef<TextInput, TextInputProps>((p, ref) => (
  <TextInput
    {...p}
    ref={ref}
    placeholderTextColor="#9B9C9C"
    className="w-12 rounded-[12px] border border-neutral-700 bg-neutral-50 px-3 py-4 text-center font-sharp-20 text-[16px] leading-[20.4px]"
    style={[FontFeatureStyle, p.style]}
  />
))
