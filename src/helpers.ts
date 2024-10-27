// module "helpers"
import { match, P } from "ts-pattern"

interface ElementAttributes {
  [key: string]: string
}

function createNode(node: string, attributes: ElementAttributes): HTMLElement {
  const el = document.createElement(node)
  for (let key in attributes) {
    el.setAttribute(key, attributes[key])
  }
  return el
}

const toString = (value: unknown): string =>
  match(value)
    .with(P.string, (str) => str)
    .with(P.number, (num) => num.toFixed(2))
    .with(P.boolean, (bool) => `${bool}`)
    .otherwise(() => "Unknown")

export { createNode, toString }
