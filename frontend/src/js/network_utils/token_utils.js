import { postRequest } from "./api_requests.js";

// access tokens are to be stored in-memory, as they are easily regenerated
var accessToken = ''

export function getAccessToken() {
  return accessToken
}

export async function retrieveTokens(loginInfo) {
  try {
    const response = await postRequest('/api/token/', loginInfo)

    if (response) {
      accessToken = response.access
      return 'success'
    }
  } catch (error) {
    console.error('Error: cannot retrieve tokens ', error)
  }
}

export async function verifyToken() {
  const response = await fetch('/api/token/verify/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAccessToken()}`,
    },
  })
  if (!response.ok) {
    const contents = await response.json()
    if ('detail' in contents) {
      console.log(`token: ${contents.detail}`)
    } else if (response.status != 500) {
      console.log('token: no access token found in local memory')
    }
  }

  return response.ok
}

export async function refreshToken() {
  const response = await fetch('/api/token/refresh/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAccessToken()}`,
    },
  })
  if (!response.ok) {
    const contents = await response.json()
    if ('detail' in contents) {
      console.log(`token: ${contents.detail}`)
    } else if (response.status != 500) {
      console.log('token: no refresh token found in cookies')
    }
  } else {
    const contents = await response.json()
    accessToken = contents.access
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
