
import { showLoginPanel } from "./login_panel.js";
import { showSignupPanel } from "./signup_panel.js";

document.addEventListener("DOMContentLoaded", () => {
  loadStartPage()
})

async function loadStartPage() {
  try {
    const response = await fetch('/static/components/start_page.html')
    const html = await response.text()
    document.body.innerHTML = html;

    connectLoginButton()
    connectSignupButton()
  } catch (error) {
    console.error('Error loading Start Page:', error)
  }
}

function connectLoginButton() {
  const loginButton = document.getElementById('login-button')

  if (loginButton) {
    loginButton.addEventListener('click', (e) => {
      showLoginPanel();
    });
  } else {
    console.error('Login button not found')
  }
}

function connectSignupButton() {
  const signupButton = document.getElementById('signup-button')

  if (signupButton) {
    signupButton.addEventListener('click', (e) => {
      showSignupPanel();
    });
  } else {
    console.error('Signup button not found')
  }
}
