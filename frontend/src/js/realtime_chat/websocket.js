import { addMessage, inFriendsPage } from "./chat_utils.js";

export let chatSocket = null
let selectedUserId = -1
let reconnectAttempts = 0;
let maxReconnectAttempts = 5;

export function connectChat(receiverId) {
  // return if:
  // - already an existing WebSocket that is in the state OPEN / CONNECTING
  // AND
  // - the same user is selected
  if (chatSocket &&
    (chatSocket.readyState === WebSocket.OPEN || chatSocket.readyState === WebSocket.CONNECTING) &&
    selectedUserId === receiverId
  ) {
    console.log('Chat socket is already open or connecting')
    return
  }

  // close chatSocket if:
  // - already an existing WebSocket that is in the state (check done in closeChatSocket function)
  // AND
  // - a different user is selected
  // this is to allow for a new WebSocket connection to a different room to open
  if (selectedUserId !== receiverId) {
    closeChatSocket()
    console.log('Closed chat socket')
  }

  selectedUserId = receiverId

  // open a new WebSocket
  const webSocketUrl = 'ws://' + window.location.host + '/ws/chat/' + selectedUserId + '/'

  chatSocket = new WebSocket(webSocketUrl)

  chatSocket.onopen = function (e) {
    console.log("Successfully connected to the chat socket: ", webSocketUrl);
    reconnectAttempts = 0
  }

  chatSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);
    console.log(data)

    if (data) {
      addMessage(data.sender_username, '/static/images/kirby.png', data.message, data.timestamp)
    }
  };

  chatSocket.onclose = function (e) {
    console.log(e)
    if (e.wasClean) {
      console.log('Chat socket connection closed cleanly');
    } else {
      if (e.code === 1006) {
        console.log('Chat socket connection lost unexpectedly. Reconnecting...')
        reconnectChatSocket(selectedUserId)
      }
    }
  };

  chatSocket.onerror = function (err) {
    console.error("Chat socket encountered an error: " + err.message);
    chatSocket.close();
  }
}

export function closeChatSocket() {
  if (chatSocket && (chatSocket.readyState === WebSocket.OPEN)) {
    chatSocket.close()
  }
}

// - implements exponential backoff where the wait tsime between network request
// retries increases exponentially
// - prevents overwhelming a system / server
function reconnectChatSocket(selectedUserId) {
  if (reconnectAttempts < maxReconnectAttempts) {
    setTimeout(() => {
      reconnectAttempts++
      console.log('Reconnecting... Attempt ', reconnectAttempts)
      connectChat(selectedUserId)
    }, Math.min(1000 * Math.pow(2, reconnectAttempts), 30000));
  } else {
    alert('Max reconnect attempts reached. Unable to reconnect. Please refresh the page or try again later.')
  }
}
