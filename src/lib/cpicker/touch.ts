const eventTypeConversion = {
  touchstart: "mousedown",
  touchmove: "mousemove",
  touchend: "mouseup",
}

function touchHandler(event) {
  let touches = event.changedTouches
  let first = touches[0]
  let type = eventTypeConversion[event.type]

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

  event.target.dispatchEvent(simulatedEvent)
  event.preventDefault()
}

export default function touchToMouse(element) {
  element.addEventListener("touchstart", touchHandler, true)
  element.addEventListener("touchmove", touchHandler, true)
  element.addEventListener("touchend", touchHandler, true)
  element.addEventListener("touchcancel", touchHandler, true)
}
