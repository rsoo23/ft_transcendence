import { getColor } from "./ui_utils/color_utils.js";
import { resetInputField, setInputFieldHint } from "./ui_utils/input_field_utils.js";
import { postRequest, getRequest } from "./network_utils/api_requests.js";
import { retrieveTokens } from "./network_utils/token_utils.js";

export let loginInfo = {}

export async function handleLogin() {
  const inputContainers = {
    'username': document.getElementById('login-username-input-container'),
    'password': document.getElementById('login-password-input-container')
  }

  loginInfo = {
    'username': document.getElementById('login-username').value,
    'password': document.getElementById('login-password').value,
  }

  if (isInputEmpty(loginInfo, inputContainers)) {
    return 'error'
  }

  try {
    const response = await postRequest('/api/login/', loginInfo)

    if (response.success) {
      const tokenResponse = await retrieveTokens(loginInfo)

      if (tokenResponse === 'success') {
        const twoFactorStatus = await status_2FA()

        if (twoFactorStatus) {
          localStorage.setItem('is2FAEnabled', true)
          return 'success-with-2fa'  // This will trigger 2FA verification
        }
        return 'success'
      }
    } else {
      handleLoginErrors(inputContainers, response.errors)
      return 'error'
    }
  } catch (error) {
    console.error('Error:', error);
    return 'error'
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

export async function status_2FA() {
  const response = await getRequest('/api/two_factor_auth/status_2FA/')

  if (response.success)
    return true
  else
    return false
}
