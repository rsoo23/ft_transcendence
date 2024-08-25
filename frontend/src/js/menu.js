
function showMenu() {
	const app = document.getElementById('app');
	app.innerHTML = `
	  <section class="container">
		<img src="static/image/pingpong.gif" alt="pingpong">
		<div class="login-container">
		  <h1 class="opacity">MENU</h1>
		  <div class="menu-items">
			<button onclick="showUserProfile()">User Profile</button>
			<button onclick="showAddFriends()">Add Friends</button>
			<button onclick="showChat()">Chat</button>
			<button onclick="showGame()">Game</button>
			<button onclick="two_factor()">Enable 2FA</button>
		  </div>
		</div>
	  </section>
	`;
  }
  
  async function showUserProfile() {
	if(await verify_token())
		alert('User Profile feature coming soon!');
	else
	{
		alert('Please Login Again !');
		showLoginPage();
	}
  }
  
  async function showAddFriends() {
	if(await verify_token())
		alert('Add Friends feature coming soon!');
	else
	{
		alert('Please Login Again !');
		showLoginPage();
	}
  }
  
  async function showChat() {
	if(await verify_token())
		alert('Chat feature coming soon!');
	else
	{
		alert('Please Login Again !');
		showLoginPage();
	}
  }
  
  async function showGame() {
	if(await verify_token())
		alert('Game feature coming soon!');
	else
	{
		alert('Please Login Again !');
		showLoginPage();
	}
  }

  async function two_factor() {
	if(await verify_token())
		showTwoFactorForm();
	else
	{
		alert('Please Login Again !');
		showLoginPage();
	}
  }

  async function verify_token() {
	const response = await fetch('/token_management/verify_token', {
		method: 'GET',
	});

	const status = await response.json();
	return(status.success);
  }

  function showTwoFactorForm() {
	const app = document.getElementById('app');
	app.innerHTML = `
	<section class="container">
		<img src="static/image/pingpong.gif" alt="pingpong">
		<div class="login-container">
			<h1 class="opacity">ENABLE TWO FACTOR</h1>
			<form id="two-factor-form">
				<input type="email" id="email" name="email" placeholder="EMAIL" required />
				<button type="submit" class="opacity">SUBMIT</button>
			</form>
			<div class="register-forget opacity">
				<a href="#" id="back">BACK</a>
			</div>
		</div>
	</section>
	`;

	document.getElementById('two-factor-form').addEventListener('submit', handleForgotPassword);
	document.getElementById('back').addEventListener('click', (e) => {
		e.preventDefault();
		location.reload(); // This will reload the page and show the login form
	});
}
