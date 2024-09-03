
export function initPanelShrinkAnim(element) {
  if (!element) {
    console.error("Error in initPanelShrinkAnim(): element not found")
  }

  element.classList.toggle('panel-shrink')
}
