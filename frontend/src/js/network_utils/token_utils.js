import { getRequest } from "./api_requests.js";

export async function verifyToken() {
  const response = await getRequest('/token_management/verify_token')
  const status = await response.json();
  return (status.success);
}

export async function handle2FA() {
  const email = document.getElementById('email').value;

  try {
    const response = await fetch('/two_factor_auth/enable_2FA/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    if (data.success) {
      alert('2FA Enabled using email:' + email);
    } else {
      alert('An error occurred. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}
