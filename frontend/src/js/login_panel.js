
import { loadComponent } from "./ui_utils/ui_utils.js";
import { getColor, getRandomColor } from "./ui_utils/color_utils.js";
import { resetInputField, setInputFieldHint } from "./ui_utils/input_field_utils.js";
import { initBackButton, initRandomColorButton } from "./ui_utils/button_utils.js"
import { initTogglePasswordVisibilityIcon } from "./ui_utils/input_field_utils.js";
import { loadMainMenuPanel } from "./main_menu_panel.js";
import { postRequest } from "./network_utils/api_requests.js";
import { isEnable2FAButtonClicked } from "./global_vars.js";
import { load2FAPanel } from "./2FA_panel.js";
import { loadStartPanel } from "./start_panel.js";
import { initLink } from "./ui_utils/link_utils.js";
import { loadContent } from "./router.js";

export async function loadLoginPanel() {
  try {
    window.history.pushState({}, '', '/login');
    await loadContent()

    initBackButton(() => loadStartPanel())
    initRandomColorButton(
      'confirm-login-button',
      'login-panel',
      () => {
        handleLogin()
        // load2FAPanel()
      }
    )
    initTogglePasswordVisibilityIcon()
    initLink(
      'forgot-password-link',
      () => handleForgotPassword()
    )
  } catch (error) {
    console.error('Error loading Login Panel:', error)
  }
}

async function handleLogin() {
  const inputContainers = {
    'username': document.getElementById('login-username-input-container'),
    'password': document.getElementById('login-password-input-container')
  }

  const loginInfo = {
    'username': document.getElementById('login-username').value,
    'password': document.getElementById('login-password').value,
  }

  if (isInputEmpty(loginInfo, inputContainers)) {
    return
  }

  try {
    const response = await postRequest('/api/login/', loginInfo)

    if (response.success) {
      // await getIdToken(loginInfo);

      if (isEnable2FAButtonClicked) {
        load2FAPanel()
      } else {
        loadMainMenuPanel()
      }

    } else {
      handleLoginErrors(inputContainers, response.errors)
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function getIdToken(loginInfo) {
  try {
    await postRequest('/token_management/create_token/', loginInfo)
  } catch (error) {
    console.error('Error:', error);
    alert('Token Creation Error');
  }
}

function isInputEmpty(loginInfo, inputContainers) {
  for (let key of Object.keys(loginInfo)) {
    if (!loginInfo[key]) {

      if (key === 'username') {
        setInputFieldHint(inputContainers[key], 'This field is required', getColor('magenta', 500))
      } else if (key === 'password') {
        setInputFieldHint(inputContainers[key], 'This field is required', getColor('magenta', 500), true)
      }

      return true
    } else {
      resetInputField(inputContainers[key])
    }
  }
  return false
}

function handleLoginErrors(inputContainers, errors) {
  if (errors.username) {
    setInputFieldHint(inputContainers.username, errors.username[0], getColor('magenta', 500))
  } else {
    resetInputField(inputContainers.username)
  }
  if (errors.password) {
    setInputFieldHint(inputContainers.password, errors.password[0], getColor('magenta', 500), true)
  } else {
    resetInputField(inputContainers.password)
  }
}

async function handleForgotPassword() {
  // const email = document.getElementById('email').value;
  const email = 'rongjie.soo12@gmail.com'
  try {
    const response = await postRequest('/api/forgot_password/', { email })

    if (response.success) {
      alert('If an account exists with this email, password reset instructions have been sent.');
      location.reload(); // Reload to show login form
    } else {
      alert('An error occurred. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}
