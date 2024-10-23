import { postRequest } from "../network_utils/api_requests.js";
import { currentUserInfo } from "../global_vars.js";

export async function initEmailSettings() {
    const saveButton = document.getElementById('save-button');
    const emailEditIcon = document.getElementById('email-edit-icon');
    const emailInput = document.getElementById('email-input');

	if (currentUserInfo && currentUserInfo.email) {
        emailInput.value = currentUserInfo.email;
    }

    if (saveButton) {
        saveButton.addEventListener('click', () => handleSaveEmail(emailInput));
    }
    if (emailEditIcon) {
        emailEditIcon.addEventListener('click', () => toggleEmailEdit(emailInput));
    }
}

function toggleEmailEdit(emailInput) {
    emailInput.disabled = !emailInput.disabled;
    if (!emailInput.disabled) {
        emailInput.focus();
    }
}

async function handleSaveEmail(emailInput) {
    if (emailInput.disabled) {
        return; // Don't update if the input is disabled
    }

    const newEmail = emailInput.value.trim();

    if (newEmail === '') {
        alert('Email cannot be empty');
        return;
    }

    if (!isValidEmail(newEmail)) {
        alert('Please enter a valid email address');
        return;
    }

    try {
        const response = await postRequest('/api/update_email/', { new_email: newEmail });

        if (response.status === 'success') {
            alert(response.message);
            emailInput.disabled = true;  // Disable the input after successful update
        } else {
            alert('Failed to update email: ' + response.message);
        }
    } catch (error) {
        console.error('Error updating email:', error);
        alert('An error occurred while updating the email. Please try again.');
    }
}

function isValidEmail(email) {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}