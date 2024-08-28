
import { loadComponent } from "./utils/ui_utils.js";
import { addEventListenerTo } from "./utils/ui_utils.js";
import { getColor, getRandomColor } from "./utils/color_utils.js";
import { resetInputField, setInputFieldHint } from "./utils/input_field_utils.js";

import { initBackToStartButton } from "./utils/button_utils.js"
import { initTogglePasswordVisibilityIcon } from "./utils/input_field_utils.js";
import { loadMainMenuPanel } from "./main_menu_panel.js";

export async function loadLoginPanel() {
  try {
    await loadComponent('components/login_panel.html')

    initBackToStartButton()
    initConfirmLoginButton()
    initTogglePasswordVisibilityIcon()
  } catch (error) {
    console.error('Error loading Login Panel:', error)
  }
}

function initConfirmLoginButton() {
  const button = document.getElementById('confirm-login-button')
  let colorInfo = {
    hex: '',
    name: ''
  }
  // let hi = true

  addEventListenerTo(
    button,
    'click',
    () => {
      // const inputFieldContainer1 = document.getElementById('login-username-input-container')
      // const inputFieldContainer2 = document.getElementById('login-password-input-container')
      //
      // if (hi) {
      //   setInputFieldHint(inputFieldContainer1, 'Username already exists', getColor('magenta', 500))
      //   setInputFieldHint(inputFieldContainer2, 'Incorrect password', getColor('magenta', 500), true)
      //   hi = false
      // } else {
      //   resetInputField(inputFieldContainer1)
      //   resetInputField(inputFieldContainer2, true)
      //   hi = true
      // }
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
