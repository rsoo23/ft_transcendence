
import { loadComponent } from "./utils/ui_utils.js";
import { addEventListenerTo } from "./utils/ui_utils.js";
import { getColor, getRandomColor } from "./utils/color_utils.js";
import { resetInputField, setInputFieldHint } from "./utils/input_field_utils.js";

import { initBackToStartButton } from "./utils/button_utils.js"
import { initTogglePasswordVisibilityIcon } from "./utils/input_field_utils.js";
import { loadMainMenuPanel } from "./main_menu_panel.js";
import { postRequest } from "./api_requests.js";

export async function loadLoginPanel() {
  try {
    await loadComponent('components/login_panel.html')

    initBackToStartButton()
    initConfirmLoginButton()
    initTogglePasswordVisibilityIcon()
  } catch (error) {
    console.error('Error loading Login Panel:', error)
  }
}

function initConfirmLoginButton() {
  const button = document.getElementById('confirm-login-button')
  let colorInfo = {
    hex: '',
    name: ''
  }
  // let hi = true

  addEventListenerTo(
    button,
    'click',
    () => {
      // const inputFieldContainer1 = document.getElementById('login-username-input-container')
      // const inputFieldContainer2 = document.getElementById('login-password-input-container')
      //
      // if (hi) {
      //   setInputFieldHint(inputFieldContainer1, 'Username already exists', getColor('magenta', 500))
      //   setInputFieldHint(inputFieldContainer2, 'Incorrect password', getColor('magenta', 500), true)
      //   hi = false
      // } else {
      //   resetInputField(inputFieldContainer1)
      //   resetInputField(inputFieldContainer2, true)
      //   hi = true
      // }
      handleLogin()
    }
  )

  addEventListenerTo(
    button,
    'mouseover',
    () => {
      colorInfo = getRandomColor(500)

      button.style.backgroundColor = colorInfo['hex']
      button.style.color = getColor(colorInfo['name'], 800)
    }
  )

  addEventListenerTo(
    button,
    'mouseout',
    () => {
      button.style.backgroundColor = getColor('charcoal', 700)
      button.style.color = getColor('charcoal', 100)
    }
  )

  addEventListenerTo(
    button,
    'mousedown',
    () => {
      button.style.backgroundColor = getColor(colorInfo['name'], 700)
    }
  )

  addEventListenerTo(
    button,
    'mouseup',
    () => {
      button.style.backgroundColor = colorInfo['hex']
      button.style.color = getColor(colorInfo['name'], 800)
    }
  )
}

async function handleLogin() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const usernameInputContainer = document.getElementById('login-username-input-container')
  const passwordInputContainer = document.getElementById('login-username-input-container')

  try {
    const response = await postRequest('/api/login', { username, password })

    if (response.success) {
      await getIdToken(username, password);
      alert('Login successful!');
      loadMainMenuPanel();
    } else {
      setInputFieldHint(
        usernameInputContainer,
        'User not found. Please register',
        getColor('magenta', 500)
      )
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}

async function getIdToken(username, password) {
  try {
    await postRequest('/token_management/create_token/', { username, password })
  } catch (error) {
    console.error('Error:', error);
    alert('Token Creation Error');
  }
}

function showRegisterForm() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="container">
        <img src="static/image/pingpong.gif" alt="pingpong">
        <div class="login-container">
			<h1 class="opacity">REGISTER</h1>
			<form id="register-form">
				<input type="text" id="reg-username" name="username" placeholder="USERNAME" required />
				<input type="email" id="reg-email" name="email" placeholder="EMAIL" required />
				<input type="password" id="reg-password" name="password1" placeholder="PASSWORD" required />
				<input type="password" id="reg-confirm-password" name="password2" placeholder="CONFIRM PASSWORD" required />
				<button type="submit" class="opacity">REGISTER</button>
			</form>
			<div class="register-forget opacity">
				<a href="#" id="back-to-login">BACK TO LOGIN</a>
			</div>
        </div>
    </section>
    `;

  document.getElementById('register-form').addEventListener('submit', handleRegister);
  document.getElementById('back-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    location.reload(); // This will reload the page and show the login form
  });
}

async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('reg-username').value;
  const email = document.getElementById('reg-email').value;
  const password1 = document.getElementById('reg-password').value;
  const password2 = document.getElementById('reg-confirm-password').value;

  try {
    const response = await fetch('/api/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password1, password2 })
    });

    const data = await response.json();
    if (data.success) {
      alert('Registration successful! Please log in.');
      location.reload(); // Reload to show login form
    } else {
      alert('Registration failed: ' + JSON.stringify(data.errors));
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}

function showForgotPasswordForm() {
  const app = document.getElementById('app');
  app.innerHTML = `
	<section class="container">
		<img src="static/image/pingpong.gif" alt="pingpong">
		<div class="login-container">
			<h1 class="opacity">RESET PASSWORD</h1>
			<form id="forgot-password-form">
				<input type="email" id="email" name="email" placeholder="EMAIL" required />
				<button type="submit" class="opacity">RESET PASSWORD</button>
			</form>
			<div class="register-forget opacity">
				<a href="#" id="back-to-login">BACK TO LOGIN</a>
			</div>
		</div>
	</section>
	`;

  document.getElementById('forgot-password-form').addEventListener('submit', handleForgotPassword);
  document.getElementById('back-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    location.reload(); // This will reload the page and show the login form
  });
}

async function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;

  try {
    const response = await fetch('/api/forgot-password/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    if (data.success) {
      alert('If an account exists with this email, password reset instructions have been sent.');
      location.reload(); // Reload to show login form
    } else {
      alert('An error occurred. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}
