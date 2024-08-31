
import { initBackToStartButton } from "./ui_utils/button_utils.js";
import { loadComponent } from "./ui_utils/ui_utils.js";
import { addEventListenerTo } from "./ui_utils/ui_utils.js";
import { getColor, getRandomColor } from "./ui_utils/color_utils.js";
import { initTogglePasswordVisibilityIcon } from "./ui_utils/input_field_utils.js";
import { postRequest } from "./network_utils/api_requests.js";
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

// password1: first password input
// password2: password input confirmation
async function handleSignup() {
  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password1 = document.getElementById('signup-password').value;
  const password2 = document.getElementById('signup-password-confirmation').value;

  try {
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


