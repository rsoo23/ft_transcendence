
import { initBackToStartButton } from "./utils/button_utils.js";
import { loadComponent } from "./utils/ui_utils.js";
import { addEventListenerTo } from "./utils/ui_utils.js";
import { getColor, getRandomColor } from "./utils/color_utils.js";
import { initTogglePasswordVisibilityIcon } from "./utils/input_field_utils.js";
import { resetInputField, setInputFieldHint } from "./utils/input_field_utils.js";
import { loadMainMenuPanel } from "./main_menu_panel.js";
import { postRequest } from "./api_requests.js";
import { loadLoginPanel } from "./login_panel.js";

export async function loadSignupPanel() {
  try {
    await loadComponent('components/signup_panel.html')

    initBackToStartButton()
    initConfirmSignupButton()
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

async function handleSignup() {
  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const passwordConfirmation = document.getElementById('signup-password-confirmation').value;

  try {
    const response = await postRequest('/api/register/', { username, email, password, passwordConfirmation })

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


