import { addMessage, inFriendsPage } from "./chat_utils.js";

export let chatSocket = null
let selectedUserId = -1

export function connectChat(receiverId) {
  // return if:
  // - already an existing WebSocket that is in the state OPEN / CONNECTING
  // AND
  // - the same user is selected
  if (chatSocket &&
    (chatSocket.readyState === WebSocket.OPEN || chatSocket.readyState === WebSocket.CONNECTING) &&
    selectedUserId === receiverId
  ) {
    console.log('WebSocket is already open or connecting')
    return
  }

  // close chatSocket if:
  // - already an existing WebSocket that is in the state (check done in closeChatSocket function)
  // AND
  // - a different user is selected
  // this is to allow for a new WebSocket connection to a different room to open
  if (selectedUserId !== receiverId) {
    closeChatSocket()
    console.log('Closed WebSocket')
  }

  selectedUserId = receiverId

  // open a new WebSocket
  const webSocketUrl = 'ws://' + window.location.host + '/ws/chat/' + selectedUserId + '/'

  chatSocket = new WebSocket(webSocketUrl)

  chatSocket.onopen = function (e) {
    console.log("Successfully connected to the WebSocket: ", webSocketUrl);
  }

  chatSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);
    console.log(data)

    if (data) {
      addMessage(data.sender_username, '/static/images/kirby.png', data.message, data.timestamp)
    }
  };

  chatSocket.onclose = function (e) {
    console.log('WebSocket connection closed');
  };

  chatSocket.onerror = function (err) {
    console.error("WebSocket encountered an error: " + err.message);
    chatSocket.close();
  }
}

export function closeChatSocket() {
  if (chatSocket && (chatSocket.readyState === WebSocket.OPEN)) {
    chatSocket.close()
  }
}
