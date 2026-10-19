// Only the Node APIs the build scripts use.
declare module "node:fs" {
  export const readFileSync: (path: string | URL, encoding: "utf8") => string
  export const writeFileSync: (path: string | URL, data: string) => void
}
