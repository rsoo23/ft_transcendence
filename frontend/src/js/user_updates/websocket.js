import { getAccessToken } from "../network_utils/token_utils.js";
import { hideOverlay, showOverlay } from "../ui_utils/overlay_utils.js";
import { handleOnlineStatusUpdate, handleStatusBadges, handleUsernameUpdate } from "./utils.js";

export let userUpdateSocket = null
let reconnectAttempts = 0;
let maxReconnectAttempts = 5;

export function connectUserUpdateSocket() {
  if (userUpdateSocket &&
    (userUpdateSocket.readyState === WebSocket.OPEN || userUpdateSocket.readyState === WebSocket.CONNECTING)) {
    console.log('User update socket is already open or connecting')
    return
  }

  const webSocketUrl = 'ws://' + window.location.host + '/ws/user_update/'
  userUpdateSocket = new WebSocket(webSocketUrl, ['Authorization', getAccessToken()])

  userUpdateSocket.onopen = function (e) {
    console.log("Successfully connected to the user update socket: ", webSocketUrl);
    reconnectAttempts = 0
    hideOverlay('main-menu-overlay')
  }

  userUpdateSocket.onmessage = async function (e) {
    const data = JSON.parse(e.data);
    console.log(data)

    if (data.action === 'update_username') {
      handleUsernameUpdate(data)
      alert('Username updated successfully')
    } else if (data.action === 'update_online_status') {
      handleOnlineStatusUpdate(data)
      handleStatusBadges(data)
    }
  };

  userUpdateSocket.onclose = function (e) {
    console.log(e)
    if (e.wasClean) {
      console.log('User update socket connection closed cleanly');
    } else {
      if (e.code === 1006) {
        console.log('User update socket connection lost unexpectedly. Reconnecting...')
        reconnectUserUpdateSocket()
      }
    }
  };

  userUpdateSocket.onerror = function (err) {
    console.error("User update socket encountered an error: " + err);
    userUpdateSocket.close();
  }
}

export function closeUserUpdateSocket() {
  if (userUpdateSocket && (userUpdateSocket.readyState === WebSocket.OPEN)) {
    userUpdateSocket.close()
  }
}

// - implements exponential backoff where the wait time between network request
// retries increases exponentially
// - prevents overwhelming a system / server
function reconnectUserUpdateSocket() {
  if (reconnectAttempts < maxReconnectAttempts) {
    const maxBackoff = 30000
    const reconnectWait = Math.min(1000 * Math.pow(2, reconnectAttempts), maxBackoff)

    setTimeout(() => {
      console.log('Reconnecting... Attempt ', reconnectAttempts)

      reconnectAttempts++
      showOverlay('main-menu-overlay', 'Reconnecting...')

      connectUserUpdateSocket()
    }, reconnectWait);
  } else {
    alert('Max reconnect attempts reached. Unable to reconnect. Please refresh the page or try again later.')
  }
}

