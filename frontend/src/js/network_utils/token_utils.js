import { getRequest, postRequest } from "./api_requests.js";

export async function verifyToken() {
  const response = await getRequest('/token_management/verify_token')
  const status = await response.json();
  return (status.success);
}

export async function send_2FA_code_email(email) {
  try {
    const response = await postRequest('/two_factor_auth/email_2FA_send_code/', { email })

    if (response.success) {
      alert('2FA code sent to email: ' + email);
    } else {
      alert('An error occurred. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}
