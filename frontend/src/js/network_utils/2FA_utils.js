import { getRequest, postRequest } from "./api_requests.js";

export async function send_otp_2FA() {
    try {
      const response = await postRequest('/api/two_factor_auth/send_otp_2FA/')
  
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
