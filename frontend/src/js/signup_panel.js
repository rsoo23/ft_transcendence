
import { initBackButton, initRandomColorButton } from "./ui_utils/button_utils.js"
import { loadComponent } from "./ui_utils/ui_utils.js";
import { addEventListenerTo } from "./ui_utils/ui_utils.js";
import { getColor, getRandomColor } from "./ui_utils/color_utils.js";
import { initTogglePasswordVisibilityIcon, resetInputField } from "./ui_utils/input_field_utils.js";
import { postRequest } from "./network_utils/api_requests.js";
import { loadLoginPanel } from "./login_panel.js";
import { send_2FA_code_email } from "./network_utils/token_utils.js";
import { isEnable2FAButtonClicked, toggle2FAButton } from "./global_vars.js";
import { loadStartPanel } from "./start_panel.js";
import { setInputFieldHint } from "./ui_utils/input_field_utils.js";
import { loadMainMenuPanel } from "./main_menu_panel.js";
import { load2FAPanel } from "./2FA_panel.js";


export async function loadSignupPanel() {
  try {
    await loadComponent('components/signup_panel.html')

    initBackButton(() => loadStartPanel())
    initRandomColorButton(
      'confirm-signup-button',
      'signup-panel',
      () => {
        handleSignup()
      }
    )
    initEnable2FAButton('signup-panel', () => handle2FA())
    initTogglePasswordVisibilityIcon()
  } catch (error) {
    console.error('Error loading Login Panel:', error)
  }
}

function initEnable2FAButton(panelID, callback) {
  const button = document.getElementById('enable-2fa-button')
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

// password1: first password input
// password2: password input confirmation
async function handleSignup() {
  const inputContainers = {
    'username': document.getElementById('signup-username-input-container'),
    'email': document.getElementById('signup-email-input-container'),
    'password1': document.getElementById('signup-password-input-container'),
    'password2': document.getElementById('signup-confirm-password-input-container')
  }

  const signupInfo = {
    'username': document.getElementById('signup-username').value,
    'email': document.getElementById('signup-email').value,
    'password1': document.getElementById('signup-password').value,
    'password2': document.getElementById('signup-password-confirmation').value
  }

  if (isInputEmpty(signupInfo, inputContainers)) {
    return
  }

  try {
    console.log('isEnable2FAButtonClicked: ', isEnable2FAButtonClicked)
    if (isEnable2FAButtonClicked) {
      send_2FA_code_email(document.getElementById('signup-email').value)
    }

    const response = await postRequest('/api/register/', signupInfo)

    if (response.success) {
      loadMainMenuPanel()
    } else {
      handleSignupErrors(inputContainers, response.errors)
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function handle2FA() {
  const inputContainers = {
    'username': document.getElementById('signup-username-input-container'),
    'email': document.getElementById('signup-email-input-container'),
    'password1': document.getElementById('signup-password-input-container'),
    'password2': document.getElementById('signup-confirm-password-input-container')
  }

  const signupInfo = {
    'username': document.getElementById('signup-username').value,
    'email': document.getElementById('signup-email').value,
    'password1': document.getElementById('signup-password').value,
    'password2': document.getElementById('signup-password-confirmation').value
  }

  if (isInputEmpty(signupInfo, inputContainers)) {
    return
  }

  try {
    const response = await postRequest('/api/register/', signupInfo)

    if (response.success) {
      send_2FA_code_email(document.getElementById('signup-email').value)
      load2FAPanel()
    } else {
      handleSignupErrors(inputContainers, response.errors)
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

function isInputEmpty(signupInfo, inputContainers) {
  for (let key of Object.keys(signupInfo)) {
    if (!signupInfo[key]) {
      setInputFieldHint(inputContainers[key], 'This field is required', getColor('magenta', 500))
      return true
    } else {
      resetInputField(inputContainers[key])
    }
  }
  return false
}

function handleSignupErrors(inputContainers, errors) {
  if (errors.username) {
    setInputFieldHint(inputContainers.username, errors.username[0], getColor('magenta', 500))
  } else {
    resetInputField(inputContainers.username)
  }
  if (errors.email) {
    setInputFieldHint(inputContainers.email, errors.email[0], getColor('magenta', 500))
  } else {
    resetInputField(inputContainers.email)
  }
  if (errors.password1) {
    setInputFieldHint(inputContainers.password1, errors.password1[0], getColor('magenta', 500))
  } else {
    resetInputField(inputContainers.password1)
  }
  if (errors.password2) {
    setInputFieldHint(inputContainers.password2, errors.password2[0], getColor('magenta', 500))
  } else {
    resetInputField(inputContainers.password2)
  }
}
