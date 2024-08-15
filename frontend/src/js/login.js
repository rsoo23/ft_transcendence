function showLoginPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <section class="container">
        <img src="static/image/pingpong.gif" alt="pingpong">
        <div class="login-container">
            <h1 class="opacity">LOGIN</h1>
            <form id="login-form">
                <input type="text" id="username" name="username" placeholder="USERNAME" required />
                <input type="password" id="password" name="password" placeholder="PASSWORD" required />
                <button type="submit" class="opacity">SUBMIT</button>
            </form>
            <div class="register-forget opacity">
                <a href="#" id="register-link">REGISTER</a>
                <a href="#" id="forgot-password-link">FORGOT PASSWORD</a>
            </div>
        </div>
    </section>
    `;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (data.success) {
				await get_ID_Token(username, password);
                alert('Login successful!');
                showMenu();
            } else {
                alert('Login failed: ' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    });

	document.getElementById('register-link').addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterForm();
    });
    document.getElementById('forgot-password-link').addEventListener('click', (e) => {
        e.preventDefault();
        showForgotPasswordForm();
    });
}

async function get_ID_Token(username, password) {
	try {
		const status = await fetch('/token_management/create_token/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username, password })
		});
	} catch (error) {
		console.error('Error:', error);
		alert('Token Creation Error');
		return (false);
	}
}

// Separate function for handling login
async function handleLogin(e) {
	e.preventDefault();
	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;

	try {
		const response = await fetch('/api/login/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username, password })
		});

		const data = await response.json();
		if (data.success) {
			alert('Login successful!');
			showMenu();
		} else {
			alert('Login failed: ' + data.error);
		}
	} catch (error) {
		console.error('Error:', error);
		alert('An error occurred. Please try again.');
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
