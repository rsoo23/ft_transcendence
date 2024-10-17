
import { getColor } from "./ui_utils/color_utils.js";
import { resetInputField, setInputFieldHint } from "./ui_utils/input_field_utils.js";
import { postRequest } from "./network_utils/api_requests.js";

export async function handleLogin() {
  const inputContainers = {
    'username': document.getElementById('login-username-input-container'),
    'password': document.getElementById('login-password-input-container')
  }

  const loginInfo = {
    'username': document.getElementById('login-username').value,
    'password': document.getElementById('login-password').value,
  }

  if (isInputEmpty(loginInfo, inputContainers)) {
    return 'error'
  }

  try {
    const response = await postRequest('/api/login/', loginInfo)

    console.log(response)
    if (response.success) {
      const response = await retrieveTokens(loginInfo)

      if (response === 'success') {
        return 'success'
      }
    } else {
      handleLoginErrors(inputContainers, response.errors)
      return
    }
  } catch (error) {
    console.error('Error:', error);
    return 'error'
  }
}

export async function retrieveTokens(loginInfo) {
  try {
    const response = await postRequest('/api/token/', loginInfo)

    if (response) {
      return 'success'
    }
  } catch (error) {
    console.error('Error: cannot retrieve tokens ', error)
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

