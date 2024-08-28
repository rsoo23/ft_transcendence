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
		  </div>
		</div>
	  </section>
	`;
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

  async function verify_token() {
	const response = await fetch('/token_management/verify_token', {
		method: 'GET',
	});

	const status = await response.json();
	return(status.success);
  }
