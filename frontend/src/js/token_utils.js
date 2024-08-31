import { getRequest } from "./api_requests.js";

export async function verifyToken() {
  const response = await getRequest('/token_management/verify_token')
  const status = await response.json();
  return (status.success);
}
