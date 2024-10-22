
export function showOverlay(elementId, text) {
  const overlay = document.getElementById(elementId)

  if (overlay) {
    overlay.style.display = 'flex'
    overlay.innerHTML = text
  } else {
    console.error('Error in showOverlay: unable to find element with id ', elementId)
  }
}

export function changeOverlayText(elementId, text) {
  const overlay = document.getElementById(elementId)

  if (overlay) {
    overlay.innerHTML = text
  } else {
    console.error('Error in changeOverlayText: unable to find element with id ', elementId)
  }
}

export function hideOverlay(elementId) {
  const overlay = document.getElementById(elementId)

  if (overlay) {
    overlay.style.display = 'none'
  } else {
    console.error('Error in hideOverlay: unable to find element with id ', elementId)
  }
}
