import { resetInputField, setInputFieldHint } from "../ui_utils/input_field_utils.js";
import { getColor } from "../ui_utils/color_utils.js";
import { putRequest } from "../network_utils/api_requests.js";

export async function verify_code() {
  const inputContainers = {
    'code': document.getElementById('forgot-password-code-input-container')
  }

  const info = {
    'code': document.getElementById('forgot-password-code').value,
  }

  if (isInputEmpty(info, inputContainers)) {
    return 'error'
  }

  try {
    const response = await putRequest('/api/verify_change_password_code/', info)

    if (response.success) {
      alert('Change password code verified')
      return 'success'
    } else {
      alert('Change password code is wrong')
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
