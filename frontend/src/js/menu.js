
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
  
  function showUserProfile() {
	alert('User Profile feature coming soon!');
  }
  
  function showAddFriends() {
	alert('Add Friends feature coming soon!');
  }
  
  function showChat() {
	alert('Chat feature coming soon!');
  }
  
  function showGame() {
	alert('Game feature coming soon!');
  }
