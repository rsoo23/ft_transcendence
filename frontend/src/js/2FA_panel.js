
import { loadComponent } from "./ui_utils/ui_utils.js"
import { initBackButton, initRandomColorButton } from "./ui_utils/button_utils.js"
import { loadMainMenuPanel } from "./main_menu_panel.js"
import { send_otp_2FA} from "./network_utils/token_utils.js"
import { getColor} from "./ui_utils/color_utils.js";
import { addEventListenerTo } from "./ui_utils/ui_utils.js";
import { isSubmit2FAButtonClicked, toggle2FAButton, toggle2FASubmitButton } from "./global_vars.js";

export async function load2FAPanel() {
  try {
    await loadComponent('components/2FA_panel.html')

    toggle2FAButton()
    initBackButton(() => loadMainMenuPanel())
    initResendCodeButton(() => send_otp_2FA())
    initRandomColorButton(
      'confirm-2fa-button',
      'two-fa-panel',
      () => {
        loadMainMenuPanel()
      }
    )
    initSubmit2FAButton()
  } catch (error) {
    console.error('Error loading 2FA Panel:', error)
  }
}

function initSubmit2FAButton() {
  const button = document.getElementById('confirm-2fa-button')
  let teal500 = getColor('teal', 500)
  let teal700 = getColor('teal', 700)
  let teal800 = getColor('teal', 800)
  let charcoal100 = getColor('charcoal', 100)
  let charcoal700 = getColor('charcoal', 700)

  addEventListenerTo(
    button,
    'click',
    () => {
      if (!isSubmit2FAButtonClicked) {
        toggle2FASubmitButton()
      } else {
        toggle2FASubmitButton()
        button.style.backgroundColor = charcoal700
        button.style.color = charcoal100
      }
    }
  )

  addEventListenerTo(
    button,
    'mouseover',
    () => {
      button.style.backgroundColor = teal500
      button.style.color = teal800
    }
  )

  addEventListenerTo(
    button,
    'mouseout',
    () => {
      if (!isSubmit2FAButtonClicked) {
        button.style.backgroundColor = charcoal700
        button.style.color = charcoal100
      } else {
        button.style.backgroundColor = teal500
        button.style.color = teal800
      }
    }
  )

  addEventListenerTo(
    button,
    'mousedown',
    () => {
      button.style.backgroundColor = teal700
    }
  )

  addEventListenerTo(
    button,
    'mouseup',
    () => {
      button.style.backgroundColor = teal500
      button.style.color = teal800
    }
  )
}

function initResendCodeButton(callback) {
  const button = document.getElementById('resend-code-button')

  addEventListenerTo(
    button,
    'click',
    () => {
      callback()
    }
  )

  addEventListenerTo(
    button,
    'mouseover',
    () => {
      button.style.textDecoration = 'underline'
    }
  )

  addEventListenerTo(
    button,
    'mouseout',
    () => {
      button.style.textDecoration = 'none'
    }
  )

  addEventListenerTo(
    button,
    'mousedown',
    () => {
      button.style.textDecoration = 'underline'
    }
  )

  addEventListenerTo(
    button,
    'mouseup',
    () => {
      button.style.textDecoration = 'none'
    }
  )
}