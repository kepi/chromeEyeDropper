import { ColorModel, RgbNotation } from './color'

const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text)
    } catch (err) {
        console.error('Failed to copy color to clipboard: ', err)
    }
}

const clipColor = ({
    color,
    model,
    format,
}: {
    color: Color
    model: ColorModel
    format: RgbNotation
}) => {
    if (model == ColorModel.RGB) {
        const prefix = format === RgbNotation.HexadecimalNoGrid ? '' : '#'
        const colorToClip = `${prefix}${color.rgbhex}`
        copyToClipboard(colorToClip)
    }
}

export { copyToClipboard, clipColor }
