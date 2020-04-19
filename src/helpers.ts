// module "helpers"
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

export { createNode }
