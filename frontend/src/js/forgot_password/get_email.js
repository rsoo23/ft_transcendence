import { resetInputField, setInputFieldHint } from "../ui_utils/input_field_utils.js";
import { getColor } from "../ui_utils/color_utils.js";
import { putRequest } from "../network_utils/api_requests.js";
import { getEmailToken } from "../network_utils/token_utils.js";
import { send_otp_forgot_password } from "../network_utils/2FA_utils.js";
import { loadPage } from "../router.js";

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
      await getEmailToken(info)
      send_otp_forgot_password()
      return 'success'
    } else {
      alert('Email does not exist')
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

export function initEmailForm() {
    const form = document.getElementById('forgot-password-form');
    const submitButton = document.getElementById('submit-email-button');
    const emailInput = document.getElementById('forgot-password-email');
    
    form.onsubmit = async (e) => {
      e.preventDefault();
      const result = await check_email();
      if (result === 'success') {
          loadPage('forgot_password/verify_code');
      }
    };
    
    // Enter key press
    emailInput.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const result = await check_email();
        if (result === 'success') {
            loadPage('forgot_password/verify_code');
        }
      }
    });
    
    // Button click
    submitButton.onclick = async () => {
      const result = await check_email();
      if (result === 'success') {
          loadPage('forgot_password/verify_code');
      }
    };
  }