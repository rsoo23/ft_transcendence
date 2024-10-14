
import { getColor } from "./ui_utils/color_utils.js";
import { resetInputField, setInputFieldHint } from "./ui_utils/input_field_utils.js";
import { postRequest, setAccessToken } from "./network_utils/api_requests.js";
import { isEnable2FAButtonClicked } from "./global_vars.js";

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
    // const response = await postRequest('/api/login/', loginInfo)
    const response = await postRequest('/api/token/', loginInfo)

    console.log(response)
    if (response) {
      setAccessToken(response['access'])

      if (isEnable2FAButtonClicked) {
        return 'success-with-2fa'
      }
      return 'success'

    } else {
      handleLoginErrors(inputContainers, response.errors)
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

export async function handleForgotPassword() {
  // const email = document.getElementById('email').value;
  const email = 'rongjie.soo12@gmail.com'
  try {
    const response = await postRequest('/api/forgot_password/', { email })

    if (response.success) {
      alert('If an account exists with this email, password reset instructions have been sent.');
      location.reload(); // Reload to show login form
    } else {
      alert('An error occurred. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}
