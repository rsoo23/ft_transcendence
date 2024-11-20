import { closeFriendSystemSocket } from "../friends_system/websocket.js";
import { postRequest } from "../network_utils/api_requests.js";
import { closeChatSocket } from "../realtime_chat/websocket.js";
import { loadPage } from "../router.js";
import { closeUserUpdateSocket } from "../user_updates/websocket.js";

export async function handleLogout() {
  try {
    const response = await postRequest("/api/logout/", {
      credentials: "include",
    });

    if (response.success) {
      alert("Logged out successfully");

      closeUserUpdateSocket()
      closeChatSocket()
      closeFriendSystemSocket()

      localStorage.setItem('is2FAVerified', false)

      loadPage("start");
    } else {
      alert("Logout failed: " + (response.error || "Unknown error"));
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred during logout. Please try again.");
  }
}

export function initLogoutButton() {
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
  }
}
