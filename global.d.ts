export {}

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      className?: string
    }
    interface IntrinsicClassAttributes<T> {
      className?: string
    }
  }
}

declare module "react-native" {
  interface ViewProps {
    className?: string
  }
  interface TextProps {
    className?: string
  }
  interface ImageProps {
    className?: string
  }
}
