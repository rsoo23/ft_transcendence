import { getColor } from "./ui_utils/color_utils.js";
import { resetInputField } from "./ui_utils/input_field_utils.js";
import { postRequest } from "./network_utils/api_requests.js";
import { setInputFieldHint } from "./ui_utils/input_field_utils.js";

// password1: first password input
// password2: password input confirmation
export async function handleSignup() {
  const inputContainers = {
    'username': document.getElementById('signup-username-input-container'),
    'email': document.getElementById('signup-email-input-container'),
    'password1': document.getElementById('signup-password-input-container'),
    'password2': document.getElementById('signup-confirm-password-input-container')
  }

  const signupInfo = {
    'username': document.getElementById('signup-username').value,
    'email': document.getElementById('signup-email').value,
    'password1': document.getElementById('signup-password').value,
    'password2': document.getElementById('signup-password-confirmation').value
  }

  if (isInputEmpty(signupInfo, inputContainers)) {
    return 'error'
  }

  try {
    const response = await postRequest('/api/register/', signupInfo)

    if (response.success) {
      return 'success'
    } else {
      handleSignupErrors(inputContainers, response.errors)
      return 'error'
    }
  } catch (error) {
    console.error('Error:', error);
    return 'error'
  }
}

function isInputEmpty(signupInfo, inputContainers) {
  for (let key of Object.keys(signupInfo)) {
    if (!signupInfo[key]) {
      setInputFieldHint(inputContainers[key], 'This field is required', getColor('magenta', 500))
      return true
    } else {
      resetInputField(inputContainers[key])
    }
  }
  return false
}

function handleSignupErrors(inputContainers, errors) {
  if (errors.username) {
    setInputFieldHint(inputContainers.username, errors.username[0], getColor('magenta', 500))
  } else {
    resetInputField(inputContainers.username)
  }
  if (errors.email) {
    setInputFieldHint(inputContainers.email, errors.email[0], getColor('magenta', 500))
  } else {
    resetInputField(inputContainers.email)
  }
  if (errors.password1) {
    setInputFieldHint(inputContainers.password1, errors.password1[0], getColor('magenta', 500))
  } else {
    resetInputField(inputContainers.password1)
  }
  if (errors.password2) {
    setInputFieldHint(inputContainers.password2, errors.password2[0], getColor('magenta', 500))
  } else {
    resetInputField(inputContainers.password2)
  }
}
