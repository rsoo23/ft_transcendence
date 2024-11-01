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

export async function getIdToken(loginInfo) {
  try {
    await postRequest('/api/token_management/create_token/', loginInfo)
  } catch (error) {
    console.error('Error:', error);
    alert('ID Token Creation Error');
  }
}

export async function getEmailToken(email) {
  try {
    await postRequest('/api/token_management/create_email_token/', email)
  } catch (error) {
    console.error('Error:', error);
    alert('Email Token Creation Error');
  }
}
