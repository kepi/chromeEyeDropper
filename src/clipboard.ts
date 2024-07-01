const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error("Failed to copy color to clipboard: ", err)
  }
}

export { copyToClipboard }
