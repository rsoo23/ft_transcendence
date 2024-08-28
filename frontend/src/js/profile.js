function showUserProfile() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <section class="container">
        <img src="static/image/pingpong.gif" alt="pingpong">
        <div class="profile-container">
            <h1 class="opacity">USER PROFILE</h1>
            <form id="update-profile-form">
                <input type="text" id="new-username" name="new-username" placeholder="New Username" required />
                <button type="submit" class="opacity">UPDATE USERNAME</button>
            </form>
            <button id="back-to-menu" class="opacity">BACK TO MENU</button>
        </div>
    </section>
    `;

    document.getElementById('update-profile-form').addEventListener('submit', handleUpdateProfile);
    document.getElementById('back-to-menu').addEventListener('click', showMenu);
}

async function get_ID_Token(newUsername) {
	try {
		const status = await fetch('/token_management/create_token/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ newUsername})
		});
	} catch (error) {
		console.error('Error:', error);
		alert('Token Creation Error');
		return (false);
	}
}

async function handleUpdateProfile(e) {
    e.preventDefault();
    const newUsername = document.getElementById('new-username').value;

    try {
        const response = await fetch('/api/update-profile/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: newUsername })
        });

        const data = await response.json();
        if (data.success) {
			await get_ID_Token(username);
            alert('Username updated successfully!');
            showMenu();
        } else {
            alert('Update failed: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}