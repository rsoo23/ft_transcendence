
import { loadComponent } from "./ui_utils/ui_utils.js"
import { initBackButton } from "./ui_utils/button_utils.js"
import { loadLoginPanel } from "./login_panel.js"
import { loadMainMenuPanel } from "./main_menu_panel.js"
import { addEventListenerTo } from "./ui_utils/ui_utils.js"
import { getRandomColor, getColor } from "./ui_utils/color_utils.js"

export async function load2FAPanel() {
  try {
    await loadComponent('components/2FA_panel.html')

    initBackButton(() => loadLoginPanel())
    initConfirm2FAButton()
  } catch (error) {
    console.error('Error loading 2FA Panel:', error)
  }
}

function initConfirm2FAButton() {
  const button = document.getElementById('confirm-2fa-button')
  let colorInfo = {
    hex: '',
    name: ''
  }

  addEventListenerTo(
    button,
    'click',
    () => {
      loadMainMenuPanel()
    }
  )

  addEventListenerTo(
    button,
    'mouseover',
    () => {
      colorInfo = getRandomColor(500)

      button.style.backgroundColor = colorInfo['hex']
      button.style.color = getColor(colorInfo['name'], 800)
    }
  )

  addEventListenerTo(
    button,
    'mouseout',
    () => {
      button.style.backgroundColor = getColor('charcoal', 700)
      button.style.color = getColor('charcoal', 100)
    }
  )

  addEventListenerTo(
    button,
    'mousedown',
    () => {
      button.style.backgroundColor = getColor(colorInfo['name'], 700)
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

