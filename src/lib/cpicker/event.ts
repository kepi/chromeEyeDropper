export function relativePosition(e: MouseEvent) {
  let clientX = e.clientX
  let clientY = e.clientY

  if (!e.target) return

  let rect = (e.target as HTMLElement).getBoundingClientRect()
  const relativeX = clientX - rect.x
  const relativeY = clientY - rect.y

  return {
    clientX,
    clientY,
    offsetX: rect.x,
    offsetY: rect.y,
    relativeX,
    relativeY,
  }
}
