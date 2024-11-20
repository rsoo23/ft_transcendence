import { getRequest, postRequest } from "./api_requests.js";

export async function send_otp_2FA() {
  try {
    const response = await postRequest('/api/two_factor_auth/send_otp_2FA/')

    if (response.success) {
      alert('2FA code sent to your email');
    } else {
      alert('An error occurred. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}

export async function send_otp_forgot_password() {
  try {
    const response = await postRequest('/api/send_otp_forgot_password/')

    if (response.success) {
      alert('Change password code sent to your email');
    } else {
      alert('An error occurred. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}
