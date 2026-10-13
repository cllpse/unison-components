import { Text } from "react-native"

export type DebugError = {
  message?: string
}

export default (p: DebugError) => (
  <Text
    style={{
      fontFamily: "monospace",
      fontSize: 16,
      fontWeight: "bold",
      color: "red",
      backgroundColor: "darkred",
      padding: 8,
    }}
  >
    {p.message}
  </Text>
)
