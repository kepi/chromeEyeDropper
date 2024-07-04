const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.log("Can't copy as document isn't focused")
  }
}

export { copyToClipboard }
