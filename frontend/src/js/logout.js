function showLogoutPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <section class="container">
        <img src="static/image/pingpong.gif" alt="pingpong">
        <div class="logout-container">
            <h1 class="opacity">LOGOUT</h1>
            <p class="opacity">Are you sure you want to logout?</p>
            <button id="logout-button" class="opacity">LOGOUT</button>
            <div class="logout-options opacity">
                <a href="#" id="back-to-menu">BACK TO MENU</a>
            </div>
        </div>
    </section>
    `;

    document.getElementById('logout-button').addEventListener('click', handleLogout);
    document.getElementById('back-to-menu').addEventListener('click', showMenu);
}

async function handleLogout() {
    try {
        const response = await fetch('/api/logout/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();
        if (data.success) {
            alert('Logged out successfully');
            showLoginPage();
        } else {
            alert('Logout failed: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during logout. Please try again.');
    }
}