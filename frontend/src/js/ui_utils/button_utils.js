
import { loadStartPanel } from "../start_panel.js";
import { addEventListenerTo } from "./ui_utils.js";
import { getColor, getRandomColor } from "./color_utils.js";

export function initBackButton(callback) {
  const backToStartButton = document.getElementById('back-button')
  const backIcon = document.getElementById('back-icon')
  let colorInfo = {
    hex: '',
    name: ''
  }

  addEventListenerTo(
    backToStartButton,
    'click',
    () => callback()
  )

  addEventListenerTo(
    backToStartButton,
    'mouseover',
    () => {
      colorInfo = getRandomColor(500)

      backToStartButton.style.backgroundColor = colorInfo['hex']
      backIcon.style.color = getColor(colorInfo['name'], 800)
    }
  )

  addEventListenerTo(
    backToStartButton,
    'mouseout',
    () => {
      backToStartButton.style.backgroundColor = getColor('charcoal', 700)
      backIcon.style.color = getColor('charcoal', 100)
    }
  )

  addEventListenerTo(
    backToStartButton,
    'mousedown',
    () => {
      backToStartButton.style.backgroundColor = getColor(colorInfo['name'], 700)
    }
  )

  addEventListenerTo(
    backToStartButton,
    'mouseup',
    () => {
      backToStartButton.style.backgroundColor = colorInfo['hex']
      backIcon.style.color = getColor(colorInfo['name'], 800)
    }
  )
}


