export function relativePosition(e) {
  let clientX = e.clientX
  let clientY = e.clientY

  let rect = e.target.getBoundingClientRect()
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
