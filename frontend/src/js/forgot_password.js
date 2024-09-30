import { resetInputField, setInputFieldHint } from "./ui_utils/input_field_utils.js";
import { getColor } from "./ui_utils/color_utils.js";
import { getRequest, putRequest} from "./network_utils/api_requests.js";
import { getEmailToken } from "./network_utils/token_utils.js";
export async function check_email() {
    const inputContainers = {
      'email': document.getElementById('forgot-password-email-input-container')
    }
  
    const info = {
      'email': document.getElementById('forgot-password-email').value,
    }
  
    if (isInputEmpty(info, inputContainers)) {
      return 'error'
    }
  
    try {
      const response = await putRequest('/api/email_exist/', info)
  
      if (response.success) {
        alert('email exists !')
        getEmailToken(info)
        return 'success'
      } else {
        alert('email does not exists !')
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
  
        if (key === 'email') {
          setInputFieldHint(inputContainers[key], 'This field is required', getColor('magenta', 500))
        }
        return true
      } else {
        resetInputField(inputContainers[key])
      }
    }
    return false
  }