
import { loadComponent } from "./ui_utils/ui_utils.js";
import { addEventListenerTo } from "./ui_utils/ui_utils.js";
import { getColor, getRandomColor } from "./ui_utils/color_utils.js";
import { resetInputField, setInputFieldHint } from "./ui_utils/input_field_utils.js";

import { initBackButton } from "./ui_utils/button_utils.js"
import { initTogglePasswordVisibilityIcon } from "./ui_utils/input_field_utils.js";
import { loadMainMenuPanel } from "./main_menu_panel.js";
import { postRequest } from "./network_utils/api_requests.js";
import { isEnable2FAButtonClicked } from "./global_vars.js";
import { load2FAPanel } from "./2FA_panel.js";
import { loadStartPanel } from "./start_panel.js";

export async function loadLoginPanel() {
  try {
    await loadComponent('components/login_panel.html')

    initBackButton(() => loadStartPanel())
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

  addEventListenerTo(
    button,
    'click',
    () => {
      // handleLogin()
      load2FAPanel()
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

async function handleLogin() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const usernameInputContainer = document.getElementById('login-username-input-container')
  const passwordInputContainer = document.getElementById('login-password-input-container')

  try {
    const response = await postRequest('/api/login/', { username, password })

    if (response.success) {
      await getIdToken(username, password);
      alert('Login successful!');

      if (isEnable2FAButtonClicked) {
        load2FAPanel()
      } else {
        loadMainMenuPanel()
      }

    } else {
      setInputFieldHint(
        usernameInputContainer,
        'User not found. Please register',
        getColor('magenta', 500)
      )
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}

async function getIdToken(username, password) {
  try {
    await postRequest('/token_management/create_token/', { username, password })
  } catch (error) {
    console.error('Error:', error);
    alert('Token Creation Error');
  }
}

// async function handleForgotPassword() {
//   const email = document.getElementById('email').value;
//
//   try {
//     const response = await postRequest('/api/forgot-password/', { email })
//
//     if (response.success) {
//       alert('If an account exists with this email, password reset instructions have been sent.');
//       location.reload(); // Reload to show login form
//     } else {
//       alert('An error occurred. Please try again.');
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     alert('An error occurred. Please try again.');
//   }
// }
