import { postRequest } from "./api_requests.js";

export async function verifyToken() {
  const response = await fetch('/api/token/verify/', { method: 'POST' })
  if (!response.ok) {
    const contents = await response.json()
    if ('detail' in contents) {
      console.log(`token: ${contents.detail}`)
    } else if (response.status != 500) {
      console.log('token: no access token found in local storage')
    }
  }

  return response.ok
}

export async function refreshToken() {
  const response = await fetch('/api/token/refresh/', { method: 'POST' })
  if (!response.ok) {
    const contents = await response.json()
    if ('detail' in contents) {
      console.log(`token: ${contents.detail}`)
    } else if (response.status != 500) {
      console.log('token: no refresh token found in local storage')
    }
  }

  return response.ok
}

export async function send_2FA_code_email(email) {
  try {
    const response = await postRequest('/api/two_factor_auth/email_2FA_send_code/', { email })

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
