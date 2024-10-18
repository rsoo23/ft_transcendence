import { postRequest, getRequest } from "./network_utils/api_requests.js";

export async function initSettingsPage() {
    const saveButton = document.getElementById('save-button');
	const usernameEditIcon = document.getElementById('username-edit-icon');
    const usernameInput = document.getElementById('username-input');

    await setCurrentUsername(usernameInput);

    if (saveButton) {
        saveButton.addEventListener('click', () => handleSaveSettings(usernameInput));
    }
    if (usernameEditIcon) {
        usernameEditIcon.addEventListener('click', () => toggleUsernameEdit(usernameInput));
    }
}

async function setCurrentUsername(usernameInput) {
	try {
		const response = await getRequest('/api/current_username/');
		if (response.username) {
			usernameInput.value = response.username;
			// usernameInput.placeholder = response.username;
		}
	}
	catch (error) {
		console.error('Error fetching current username:', error);
	}
}

function toggleUsernameEdit(usernameInput) {
    usernameInput.disabled = !usernameInput.disabled;
    if (!usernameInput.disabled) {
        usernameInput.focus();
    }
}

async function handleSaveSettings(usernameInput) {
    if (usernameInput.disabled) {
        return; // Don't update if the input is disabled
    }

    const newUsername = usernameInput.value.trim();

    if (newUsername === '') {
        alert('Username cannot be empty');
        return;
    }

    try {
        const response = await postRequest('/api/update_username/', { new_username: newUsername });

        if (response.status === 'success') {
            alert(response.message);
            usernameInput.disabled = true;  // Disable the input after successful update
        } else {
            alert('Failed to update username: ' + response.message);
        }
    } catch (error) {
        console.error('Error updating username:', error);
        alert('An error occurred while updating the username. Please try again.');
    }
}
