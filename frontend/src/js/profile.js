
async function showUserProfile() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <section class="container">
            <h1 class="opacity">User Profile</h1>
            <form id="profile-form">
                <input type="text" id="username" name="username" placeholder="New username" required />
                <button type="submit" class="opacity">Update Username</button>
            </form>
        </section>
    `;

    document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;

    try {
        const response = await fetch('/update-profile/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ username })
        });

        const data = await response.json();
        if (data.success) {
            alert('Username updated successfully!');
        } else {
            alert(`Update failed: ${data.error}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export { showUserProfile };