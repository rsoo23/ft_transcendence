import { initBackButton, initRandomColorButton } from "./ui_utils/button_utils.js"
import { loadMainMenuPanel } from "./main_menu_panel.js"
import { send_otp_2FA } from "./network_utils/2FA_utils.js"
import { getColor} from "./ui_utils/color_utils.js";
import { addEventListenerTo } from "./ui_utils/ui_utils.js";
import { isSubmit2FAButtonClicked, toggle2FAButton, toggle2FASubmitButton } from "./global_vars.js";
import { resetInputField, setInputFieldHint } from "./ui_utils/input_field_utils.js";
import { postRequest } from "./network_utils/api_requests.js";

export async function handle2FA() {
  const inputContainers = {
    'code': document.getElementById('two-fa-code-input-container')
  }

  const info = {
    'code': document.getElementById('two-fa-code').value,
  }

  if (isInputEmpty(info, inputContainers)) {
    return 'error'
  }

  try {
    const response = await postRequest('/api/two_factor_auth/verify_2FA/', info)

    if (response.success) {
      alert('2FA Enabled !')
      loadMainMenuPanel()
      return 'success'
    } else {
      console.log('Error')
      return 'error'
    }
  } catch (error) {
    console.error('Error:', error);
    return 'error'
  }
}

function isInputEmpty(code, inputContainers) {
  for (let key of Object.keys(code)) {
    if (!code[key]) {

      if (key === 'code') {
        setInputFieldHint(inputContainers[key], 'This field is required', getColor('magenta', 500))
      }
      return true
    } else {
      resetInputField(inputContainers[key])
    }
  }
  return false
}

export function initResendCodeButton(callback) {
  const button = document.getElementById('resend-code-button')

  addEventListenerTo(
    button,
    'click',
    () => {
      callback()
    }
  )

  addEventListenerTo(
    button,
    'mouseover',
    () => {
      button.style.textDecoration = 'underline'
    }
  )

  addEventListenerTo(
    button,
    'mouseout',
    () => {
      button.style.textDecoration = 'none'
    }
  )

  addEventListenerTo(
    button,
    'mousedown',
    () => {
      button.style.textDecoration = 'underline'
    }
  )

  addEventListenerTo(
    button,
    'mouseup',
    () => {
      button.style.textDecoration = 'none'
    }
  )
}
