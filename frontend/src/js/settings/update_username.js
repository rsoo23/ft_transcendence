import { currentUserInfo } from "../global_vars.js";
import { userUpdateSocket } from "../user_updates/websocket.js";

export async function initUsernameSettings() {
  const saveButton = document.getElementById("save-button");
  const usernameEditIcon = document.getElementById("username-edit-icon");
  const usernameInput = document.getElementById("username-input");

  if (currentUserInfo && currentUserInfo.username) {
    usernameInput.value = currentUserInfo.username;
  }

  if (saveButton) {
    saveButton.addEventListener("click", () =>
      handleSaveSettings(usernameInput)
    );
  }
  if (usernameEditIcon) {
    usernameEditIcon.addEventListener("click", () =>
      toggleUsernameEdit(usernameInput)
    );
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
    return;
  }

  const newUsername = usernameInput.value.trim();

  if (newUsername === "") {
    alert("Username cannot be empty");
    return;
  }

  userUpdateSocket.send(JSON.stringify({ action: 'update_username', new_username: newUsername }))
}

