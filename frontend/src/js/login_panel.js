
import { loadStartPage } from "./start_page.js";
import { loadComponent } from "./utils/ui_utils.js";
import { addEventListenerTo } from "./utils/ui_utils.js";

let isPasswordVisible = false;

export async function loadLoginPanel() {
  try {
    await loadComponent('components/login_panel.html')

    addEventListenerTo(
      'back-to-start-button',
      'click',
      () => loadStartPage()
    )

    addEventListenerTo(
      'toggle-password-visibility-icon',
      'click',
      () => togglePasswordVisibility()
    )
  } catch (error) {
    console.error('Error loading Login Panel:', error)
  }
}

function togglePasswordVisibility() {
  const button = document.getElementById('toggle-password-visibility-icon')
  const passwordField = document.getElementById('login-password-input')

  if (!button) {
    console.error('Error: toggle-password-visibility-icon not found')
    return
  }
  if (!passwordField) {
    console.error('Error: login-password-input not found')
    return
  }

  if (!isPasswordVisible) {
    passwordField.setAttribute('type', 'text')
    button.textContent = 'Show'
    button.innerHTML = 'visibility'
    isPasswordVisible = true
  } else {
    passwordField.setAttribute('type', 'password')
    button.textContent = 'Hide'
    button.innerHTML = 'visibility_off'
    isPasswordVisible = false
  }
}

