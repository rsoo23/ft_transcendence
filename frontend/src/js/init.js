async function initializeApp() {
    try {
        const isTokenValid = await verify_token();
        if (isTokenValid) {
            showMenu();
        } else {
            showLoginPage();
        }
    } catch (error) {
        console.error('Error during app initialization:', error);
        showLoginPage(); // Fallback to login page if there's an error
    }
}

// Call this function when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
