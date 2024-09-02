
export function showTooltip(element) {
  if (!element) {
    console.error('Error in showTooltip(): element not found')
    return
  }

  element.style.opacity = '1'
}

export function hideTooltip(element) {
  if (!element) {
    console.error('Error in hideTooltip(): element not found')
    return
  }

  element.style.opacity = '0'
}
