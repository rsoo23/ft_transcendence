import { postRequest } from "./network_utils/api_requests.js";

export function initSettingsPage() {
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
        saveButton.addEventListener('click', handleSaveSettings);
    }
}

async function handleSaveSettings() {
    const usernameInput = document.getElementById('username-input');
    const newUsername = usernameInput.value.trim();

    if (newUsername === '') {
        alert('Username cannot be empty');
        return;
    }

    try {
        const response = await postRequest('/api/update_username/', { new_username: newUsername });

        if (response.status === 'success') {
            alert(response.message);
			usernameInput.value = newUsername;
        } else {
            alert('Failed to update username: ' + response.message);
        }
    } catch (error) {
        console.error('Error updating username:', error);
        alert('An error occurred while updating the username. Please try again.');
    }
}