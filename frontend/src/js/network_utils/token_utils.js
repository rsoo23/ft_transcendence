import { getRequest, postRequest } from "./api_requests.js";

export async function verifyToken() {
  const response = await getRequest('/token_management/verify_token')
  const status = await response.json();
  return (status.success);
}

export async function getIdToken(loginInfo) {
  try {
    await postRequest('/token_management/create_token/', loginInfo)
  } catch (error) {
    console.error('Error:', error);
    alert('Token Creation Error');
  }
}

export async function send_otp_2FA() {
  try {
    const response = await postRequest('/two_factor_auth/send_otp_2FA/')

    if (response.success) {
      alert('2FA code sent to ur email');
    } else {
      alert('An error occurred. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}
