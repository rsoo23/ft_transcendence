
import { initBackToStartButton } from "./ui_utils/button_utils.js";
import { loadComponent } from "./ui_utils/ui_utils.js";
import { addEventListenerTo } from "./ui_utils/ui_utils.js";
import { getColor, getRandomColor } from "./ui_utils/color_utils.js";
import { initTogglePasswordVisibilityIcon } from "./ui_utils/input_field_utils.js";
import { postRequest } from "./network_utils/api_requests.js";
import { loadLoginPanel } from "./login_panel.js";
import { handle2FA } from "./network_utils/token_utils.js";

let isEnable2FAButtonClicked = false

export async function loadSignupPanel() {
  try {
    await loadComponent('components/signup_panel.html')

    initBackToStartButton()
    initConfirmSignupButton()
    initEnable2FAButton()
    initTogglePasswordVisibilityIcon()
  } catch (error) {
    console.error('Error loading Login Panel:', error)
  }
}

function initConfirmSignupButton() {
  const button = document.getElementById('confirm-signup-button')
  let colorInfo = {
    hex: '',
    name: ''
  }

  addEventListenerTo(
    button,
    'click',
    () => {
      handleSignup()
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

function initEnable2FAButton() {
  const button = document.getElementById('enable-2fa-button')
  let teal500 = getColor('teal', 500)
  let teal700 = getColor('teal', 700)
  let teal800 = getColor('teal', 800)
  let charcoal100 = getColor('charcoal', 100)
  let charcoal700 = getColor('charcoal', 700)

  addEventListenerTo(
    button,
    'click',
    () => {
      if (!isEnable2FAButtonClicked) {
        isEnable2FAButtonClicked = true
      } else {
        isEnable2FAButtonClicked = false
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
      if (!isEnable2FAButtonClicked) {
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

// password1: first password input
// password2: password input confirmation
async function handleSignup() {
  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password1 = document.getElementById('signup-password').value;
  const password2 = document.getElementById('signup-password-confirmation').value;

  try {
    if (isEnable2FAButtonClicked) {
      handle2FA(email)
    }

    const response = await postRequest('/api/register/', { username, email, password1, password2 })

    if (response.success) {
      alert('Registration successful! Please log in.');
      loadLoginPanel()
    } else {
      alert('Registration failed: ' + JSON.stringify(data.errors));
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}


