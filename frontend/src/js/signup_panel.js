
import { initBackButton, initRandomColorButton } from "./ui_utils/button_utils.js"
import { addEventListenerTo } from "./ui_utils/ui_utils.js";
import { getColor, getRandomColor } from "./ui_utils/color_utils.js";
import { initTogglePasswordVisibilityIcon, resetInputField } from "./ui_utils/input_field_utils.js";
import { postRequest } from "./network_utils/api_requests.js";
import { loadLoginPanel } from "./login_panel.js";
import { handle2FA } from "./network_utils/token_utils.js";
import { isEnable2FAButtonClicked, toggle2FAButton } from "./global_vars.js";
import { loadStartPanel } from "./start_panel.js";
import { setInputFieldHint } from "./ui_utils/input_field_utils.js";
import { loadMainMenuPanel } from "./main_menu_panel.js";
import { loadContent } from "./router.js";


export async function loadSignupPanel() {
  try {
    window.history.pushState({}, '', '/signup')
    await loadContent()

    initBackButton(() => loadStartPanel())
    initRandomColorButton(
      'confirm-signup-button',
      'signup-panel',
      () => {
        handleSignup()
      }
    )
    initEnable2FAButton()
    initTogglePasswordVisibilityIcon()
  } catch (error) {
    console.error('Error loading Login Panel:', error)
  }
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
        toggle2FAButton()
      } else {
        toggle2FAButton()
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
    // if (isEnable2FAButtonClicked) {
    //   handle2FA(email)
    // }

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
