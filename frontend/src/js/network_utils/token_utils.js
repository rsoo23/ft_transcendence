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
    alert('Token Creation Error');
  }
}
