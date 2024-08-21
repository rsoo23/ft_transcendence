
import { addEventListenerTo } from "./ui_utils.js"

let isPasswordVisible = false;

export function initTogglePasswordVisibilityIcon() {
  const togglePasswordVisibilityIcon = document.getElementById('toggle-password-visibility-icon')

  addEventListenerTo(
    togglePasswordVisibilityIcon,
    'click',
    () => togglePasswordVisibility(togglePasswordVisibilityIcon)
  )
}

function togglePasswordVisibility(icon) {
  const passwordField = document.querySelector('.password-container > .input-field')

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

export function resetInputField(inputFieldContainer, hasSpaceBetween = false) {
  if (!inputFieldContainer) {
    console.error('Error in resetInputField(): input-field-container  not found')
    return
  }

  const textAlertContainer = inputFieldContainer.querySelector('.text-alert-container')
  const textAlert = textAlertContainer.querySelector('.text-alert')
  const inputField = inputFieldContainer.querySelector('.input-field')

  if (!textAlert) {
    console.error('Error in resetInputField(): text-alert not found')
    return
  }
  if (!inputField) {
    console.error('Error in resetInputField(): input-field not found')
    return
  }

  inputField.style.border = ''
  textAlert.innerHTML = ''

  if (hasSpaceBetween) {
    textAlertContainer.style.justifyContent = 'flex-end'
  }
}

// sets the the input-field's border and hint color, size and text-alert-container's justification
export function setInputFieldHint(inputFieldContainer, message, colorHexVal, isSpaceBetween = false) {
  if (!inputFieldContainer) {
    console.error('Error in setInputFieldHint(): input-field-container  not found')
    return
  }

  const textAlertContainer = inputFieldContainer.querySelector('.text-alert-container')
  const textAlert = textAlertContainer.querySelector('.text-alert')
  const inputField = inputFieldContainer.querySelector('.input-field')

  const borderType = 'solid'
  const borderWidth = '3px'

  if (!textAlertContainer) {
    console.error('Error in setInputFieldHint(): text-alert-container not found')
    return
  }
  if (!textAlert) {
    console.error('Error in setInputFieldHint(): text-alert not found')
    return
  }
  if (!inputField) {
    console.error('Error in setInputFieldHint(): input-field not found')
    return
  }

  inputField.style.border = `${borderType} ${borderWidth} ${colorHexVal}`
  textAlert.innerHTML = message
  textAlert.style.color = colorHexVal

  if (isSpaceBetween) {
    textAlertContainer.style.justifyContent = 'space-between'
  }
}
