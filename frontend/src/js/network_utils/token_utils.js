import { getRequest, postRequest } from "./api_requests.js";

export async function verifyToken() {
  const response = await getRequest('/api/token_management/verify_token')
  const status = await response.json();
  return (status.success);
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
