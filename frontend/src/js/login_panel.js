
import { loadStartPage } from "./start_page.js";
import { loadComponent } from "./utils/ui_utils.js";
import { addEventListenerTo } from "./utils/ui_utils.js";
import { getColor, getRandomColor } from "./utils/color_utils.js";

let isPasswordVisible = false;

export async function loadLoginPanel() {
  try {
    await loadComponent('components/login_panel.html')

    initBackToStartButton()

    const togglePasswordVisibilityIcon = document.getElementById('toggle-password-visibility-icon')

    addEventListenerTo(
      togglePasswordVisibilityIcon,
      'click',
      () => togglePasswordVisibility(togglePasswordVisibilityIcon)
    )
  } catch (error) {
    console.error('Error loading Login Panel:', error)
  }
}

function initBackToStartButton() {
  const backToStartButton = document.getElementById('back-to-start-button')
  const backIcon = document.getElementById('back-icon')
  let colorInfo = {
    hex: '',
    name: ''
  }

  addEventListenerTo(
    backToStartButton,
    'click',
    () => loadStartPage()
  )

  addEventListenerTo(
    backToStartButton,
    'mouseover',
    () => {
      colorInfo = getRandomColor(500)

      backToStartButton.style.backgroundColor = colorInfo['hex']
      backIcon.style.color = getColor(colorInfo['name'], 800)
    }
  )

  addEventListenerTo(
    backToStartButton,
    'mouseout',
    () => {
      backToStartButton.style.backgroundColor = getColor('charcoal', 700)
      backIcon.style.color = getColor('charcoal', 100)
    }
  )

  addEventListenerTo(
    backToStartButton,
    'mousedown',
    () => {
      backToStartButton.style.backgroundColor = getColor(colorInfo['name'], 700)
    }
  )
}

function togglePasswordVisibility(icon) {
  const passwordField = document.getElementById('login-password-input')

  if (!icon) {
    console.error('Error: toggle-password-visibility-icon not found')
    return
  }
  if (!passwordField) {
    console.error('Error: login-password-input not found')
    return
  }

  if (!isPasswordVisible) {
    passwordField.setAttribute('type', 'text')
    icon.innerHTML = 'visibility'
    isPasswordVisible = true
  } else {
    passwordField.setAttribute('type', 'password')
    icon.innerHTML = 'visibility_off'
    isPasswordVisible = false
  }
}

