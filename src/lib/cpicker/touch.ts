const eventTypeConversion = {
  touchstart: "mousedown",
  touchmove: "mousemove",
  touchend: "mouseup",
}

function touchHandler(event: TouchEvent) {
  let touches = event.changedTouches
  let first = touches[0]
  let type = eventTypeConversion[event.type as keyof typeof eventTypeConversion]

  if (!type) {
    return
  }

  let simulatedEvent = new MouseEvent(type, {
    screenX: first.screenX,
    screenY: first.screenY,
    clientX: first.clientX,
    clientY: first.clientY,
    button: 0,
    buttons: 1,
  })

  const target = event.target
  if (target === null) {
    return
  }

  target.dispatchEvent(simulatedEvent)
  event.preventDefault()
}

export default function touchToMouse(element: HTMLElement) {
  element.addEventListener("touchstart", touchHandler, true)
  element.addEventListener("touchmove", touchHandler, true)
  element.addEventListener("touchend", touchHandler, true)
  element.addEventListener("touchcancel", touchHandler, true)
}
