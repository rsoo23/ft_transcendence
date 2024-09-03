
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

export function initRandomColorButton(buttonID, panelID, callback) {
  const button = document.getElementById(buttonID)
  const panel = document.getElementById(panelID)
  let colorInfo = {
    hex: '',
    name: ''
  }

  addEventListenerTo(
    button,
    'click',
    () => {
      callback();
    }
  )

  addEventListenerTo(
    button,
    'mouseover',
    () => {
      colorInfo = getRandomColor(500)

      button.style.backgroundColor = colorInfo['hex']
      panel.style.borderColor = colorInfo['hex']
      button.style.color = getColor(colorInfo['name'], 800)
    }
  )

  addEventListenerTo(
    button,
    'mouseout',
    () => {
      const color = getColor('charcoal', 100)

      button.style.backgroundColor = getColor('charcoal', 700)
      panel.style.borderColor = color
      button.style.color = color
    }
  )

  addEventListenerTo(
    button,
    'mousedown',
    () => {
      const color = getColor(colorInfo['name'], 700)

      button.style.backgroundColor = color
      panel.style.borderColor = color
    }
  )

  addEventListenerTo(
    button,
    'mouseup',
    () => {
      button.style.backgroundColor = colorInfo['hex']
      button.style.color = getColor(colorInfo['name'], 800)
    }
  )
}

