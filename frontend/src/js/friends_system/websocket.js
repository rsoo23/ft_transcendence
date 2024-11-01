import { currentChatUserId } from "../realtime_chat/chat_utils.js";
import { initFriendsPage } from "../router.js";
import { queueNotification } from "../ui_utils/notification_utils.js";
import { hideOverlay, showOverlay } from "../ui_utils/overlay_utils.js";
import { currentFriendListState, FRIEND_LIST_STATE, loadFriendListContent, loadFriendListPanel, loadFriendSearchContent, loadFriendSearchPanel } from "./utils.js";

export let friendsSystemSocket = null
let reconnectAttempts = 0;
let maxReconnectAttempts = 5;

export function connectFriendSystemSocket() {
  // return if:
  // - already an existing WebSocket that is in the state OPEN / CONNECTING
  // AND
  // - the same user is selected
  if (friendsSystemSocket &&
    (friendsSystemSocket.readyState === WebSocket.OPEN || friendsSystemSocket.readyState === WebSocket.CONNECTING)) {
    console.log('Friend system socket is already open or connecting')
    return
  }

  // open a new WebSocket
  const webSocketUrl = 'ws://' + window.location.host + '/ws/friends_system/'
  friendsSystemSocket = new WebSocket(webSocketUrl)

  friendsSystemSocket.onopen = function (e) {
    console.log("Successfully connected to the friend system socket: ", webSocketUrl);
    reconnectAttempts = 0
    hideOverlay('main-menu-overlay')
  }

  friendsSystemSocket.onmessage = async function (e) {
    const data = JSON.parse(e.data);
    console.log(data)

    handleNotifications(data)

    if (currentFriendListState === FRIEND_LIST_STATE.SHOWING_FRIEND_LIST) {
      await loadFriendListPanel()
    } else if (currentFriendListState === FRIEND_LIST_STATE.SHOWING_FRIEND_SEARCH_LIST) {
      await loadFriendSearchPanel()
    }
  };

  friendsSystemSocket.onclose = function (e) {
    console.log(e)
    if (e.wasClean) {
      console.log('Friend system socket connection closed cleanly');
    } else {
      if (e.code === 1006) {
        console.log('Friend system socket connection lost unexpectedly. Reconnecting...')
        reconnectFriendSystemSocket()
      }
    }
  };

  friendsSystemSocket.onerror = function (err) {
    console.error("Friend system socket encountered an error: " + err);
    friendsSystemSocket.close();
  }
}

export function closeFriendSystemSocket() {
  if (friendsSystemSocket && (friendsSystemSocket.readyState === WebSocket.OPEN)) {
    friendsSystemSocket.close()
  }
}

// - implements exponential backoff where the wait time between network request
// retries increases exponentially
// - prevents overwhelming a system / server
function reconnectFriendSystemSocket() {
  if (reconnectAttempts < maxReconnectAttempts) {
    const maxBackoff = 30000
    const reconnectWait = Math.min(1000 * Math.pow(2, reconnectAttempts), maxBackoff)

    setTimeout(() => {
      console.log('Reconnecting... Attempt ', reconnectAttempts)

      reconnectAttempts++
      showOverlay('main-menu-overlay', 'Reconnecting...')

      connectFriendSystemSocket()
    }, reconnectWait);
  } else {
    alert('Max reconnect attempts reached. Unable to reconnect. Please refresh the page or try again later.')
  }
}

async function handleNotifications(data) {
  if (data.action === 'friend_request_received') {
    queueNotification('blue', data.message, async () => initFriendsPage(FRIEND_LIST_STATE.SHOWING_FRIEND_SEARCH_LIST))
    await loadFriendSearchPanel()
  } else if (data.action === 'friend_request_received_cancelled') {
    queueNotification('magenta', data.message, async () => initFriendsPage(FRIEND_LIST_STATE.SHOWING_FRIEND_SEARCH_LIST))
    await loadFriendSearchPanel()
  } else if (data.action === 'friend_request_sent_accepted') {
    queueNotification('teal', data.message, async () => initFriendsPage(FRIEND_LIST_STATE.SHOWING_FRIEND_SEARCH_LIST))
    await loadFriendSearchPanel()
  } else if (data.action === 'friend_request_sent_declined') {
    queueNotification('magenta', data.message, async () => initFriendsPage(FRIEND_LIST_STATE.SHOWING_FRIEND_SEARCH_LIST))
    await loadFriendSearchPanel()
  } else if (data.action === 'blocked_by_friend') {
    queueNotification('magenta', data.message, async () => initFriendsPage(FRIEND_LIST_STATE.SHOWING_FRIEND_LIST))
    if (data.sender_id === currentChatUserId) {
      showOverlay('blocked-overlay', 'You are blocked by this user')
    }
    await loadFriendListPanel()
  } else if (data.action === 'unblocked_by_friend') {
    queueNotification('blue', data.message, async () => initFriendsPage(FRIEND_LIST_STATE.SHOWING_FRIEND_LIST))
    if (data.sender_id === currentChatUserId) {
      hideOverlay('blocked-overlay', 'You are blocked by this user')
    }
    await loadFriendListPanel()
  } else {
    queueNotification('teal', data.message, null)
  }
}

