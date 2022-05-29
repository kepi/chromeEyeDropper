type onOkCallback = (arg0: string) => void
type onCancelCallback = () => void

declare module 'medium-style-confirm' {
    export function mscConfirm(arg0: {
        title: string,
        subtitle?: string,
        okText?: string,
        cancelText?: string,
        dismissOverlay?: boolean,
        onOk?: onOkCallback,
        onCancel?: onCancelCallback,
    }): void

    export function mscPrompt(arg0: {
        title: string,
        subtitle?: string,
        defaultValue?: string,
        okText?: string,
        cancelText?: string,
        dismissOverlay?: boolean,
        placeholder?: string,
        onOk?: onOkCallback,
        onCancel?: onCancelCallback,
    }): void
}
