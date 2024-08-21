
export function setInputFieldHint(inputFieldContainer, message, colorHexVal, isSpaceBetween = false) {
  const textAlertContainer = inputFieldContainer.querySelector('.text-alert-container')
  const textAlert = textAlertContainer.querySelector('.text-alert')
  const inputField = inputFieldContainer.querySelector('.input-field')

  const borderType = 'solid'
  const borderWidth = '3px'

  if (!inputFieldContainer) {
    console.error('Error in setInputFieldHint(): input-field-container  not found')
    return
  }
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
