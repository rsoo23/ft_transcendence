
import { loadComponent } from "./utils/ui_utils.js";
import { addEventListenerTo } from "./utils/ui_utils.js";
import { getColor, getRandomColor } from "./utils/color_utils.js";

document.addEventListener("DOMContentLoaded", () => {
  loadMainMenuPanel()
})

export async function loadMainMenuPanel() {
  try {
    await loadComponent('components/menu/main_menu_panel.html')

    initPlayButton()
  } catch (error) {
    console.error('Error loading Main Menu Panel :', error)
  }
}

function initPlayButton() {
  const loginButton = document.getElementById('play-button')
  let colorInfo = {
    hex: '',
    name: ''
  }

  addEventListenerTo(
    loginButton,
    'click',
    () => {
      initPanelShrinkAnim(startPagePanel)
      setTimeout(() => {
        loadLoginPanel()
      }, ANIM_WAIT_DURATION)
    }
  )

  addEventListenerTo(
    loginButton,
    'mouseover',
    () => {
      colorInfo = getRandomColor(500)

      loginButton.style.backgroundColor = colorInfo['hex']
      loginButton.style.color = getColor(colorInfo['name'], 800)
    }
  )

  addEventListenerTo(
    loginButton,
    'mouseout',
    () => {
      loginButton.style.backgroundColor = getColor('charcoal', 700)
      loginButton.style.color = getColor('charcoal', 100)
    }
  )

  addEventListenerTo(
    loginButton,
    'mousedown',
    () => {
      loginButton.style.backgroundColor = getColor(colorInfo['name'], 700)
    }
  )

  addEventListenerTo(
    loginButton,
    'mouseup',
    () => {
      loginButton.style.backgroundColor = colorInfo['hex']
      loginButton.style.color = getColor(colorInfo['name'], 800)
    }
  )
}

