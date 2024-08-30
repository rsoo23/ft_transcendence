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

    document.getElementById('logout-button').addEventListener('click', async () => {
        try {
            const response = await fetch('/api/logout/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'  // To send cookies
            });

            const data = await response.json();
            if (data.success) {
                // Clear any stored tokens or session data
                document.cookie = 'ID_Token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                localStorage.removeItem('user');  // If storing any user data in localStorage

                alert('Logged out successfully');
                showLoginPage();  // Redirect to login page after logout
            } else {
                alert('Logout failed: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during logout. Please try again.');
        }
    });

    document.getElementById('back-to-menu').addEventListener('click', (e) => {
        e.preventDefault();
        showMenu();
    });
}