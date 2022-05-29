import { TinyColor } from '@ctrl/tinycolor'

export class EdColor extends TinyColor {
    toHex3String(): string | false {
        const hex = this.toHex(true)
        return hex.length === 3 ? '#' + hex : false
    }

    toHslString(): string {
        return super.toHslString().replace(/\s/g, "")
    }

    toRgbString(): string {
        return super.toRgbString().replace(/\s/g, "")
    }
}
