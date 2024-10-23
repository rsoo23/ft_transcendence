import { postRequest } from "../network_utils/api_requests.js";

export function initPasswordSettings() {
  const saveButton = document.getElementById("save-button");
  const passwordEditIcon = document.getElementById("password-edit-icon");
  const newPasswordInput = document.getElementById("new-password-input");
  const confirmPasswordInput = document.getElementById(
    "confirm-password-input"
  );

  if (saveButton) {
    saveButton.addEventListener("click", () =>
      handleSavePassword(newPasswordInput, confirmPasswordInput)
    );
  }
  if (passwordEditIcon) {
    passwordEditIcon.addEventListener("click", () =>
      togglePasswordEdit(newPasswordInput, confirmPasswordInput)
    );
  }
}

function togglePasswordEdit(newPasswordInput, confirmPasswordInput) {
  const isDisabled = newPasswordInput.disabled;
  newPasswordInput.disabled = !isDisabled;
  confirmPasswordInput.disabled = !isDisabled;
  if (!isDisabled) {
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";
    newPasswordInput.focus();
  }
}

async function handleSavePassword(newPasswordInput, confirmPasswordInput) {
  if (newPasswordInput.disabled) {
    return;
  }

  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  if (newPassword === "" || confirmPassword === "") {
    alert("Both password fields must be filled");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    const response = await postRequest("/api/update_password/", {
      new_password: newPassword,
    });

    if (response.status === "success") {
      alert(response.message);
      newPasswordInput.disabled = true;
      confirmPasswordInput.disabled = true;
      newPasswordInput.value = "";
      confirmPasswordInput.value = "";
    } else {
      alert("Failed to update password: " + response.message);
    }
  } catch (error) {
    console.error("Error updating password:", error);
    alert("An error occurred while updating the password. Please try again.");
  }
}
