
import { loadStartPage } from "./start_page.js";
import { loadComponent } from "./utils/ui_utils.js";
import { addEventListenerTo } from "./utils/ui_utils.js";

let isPasswordVisible = false;

export async function loadLoginPanel() {
  try {
    await loadComponent('components/login_panel.html')

    const backToStartButton = document.getElementById('back-to-start-button')

    addEventListenerTo(
      backToStartButton,
      'click',
      () => loadStartPage()
    )

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

