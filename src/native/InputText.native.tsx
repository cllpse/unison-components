import { TextInput, type TextInputProps } from "react-native"
import { FontFeatureStyle } from "../utilities/FigmaPropertyHelpers"

export default (p: TextInputProps) => (
  <TextInput
    placeholder={p.placeholder}
    value={p.value}
    onChangeText={p.onChangeText}
    secureTextEntry={p.secureTextEntry}
    placeholderTextColor="#9B9C9C"
    keyboardType={p.keyboardType}
    autoCapitalize={p.autoCapitalize}
    autoFocus={p.autoFocus}
    selectionColor="#3697ec"
    className="w-full rounded-[12px] border border-neutral-700 bg-neutral-50 px-3 py-4 font-sharp-20 text-[16px] leading-[20.4px]"
    style={FontFeatureStyle}
  />
)
