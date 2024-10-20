import { addMessage, inFriendsPage } from "./chat_utils.js";

export let chatSocket = null

export function connectChat(receiverUsername) {
  // check if there's already an existing WebSocket
  if (chatSocket && (chatSocket.readyState === WebSocket.OPEN || chatSocket.readyState === WebSocket.CONNECTING)) {
    console.log('WebSocket is already open or connecting')
    return
  }

  chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/chat/'
    + receiverUsername
    + '/',
  )

  chatSocket.onopen = function (e) {
    console.log("Successfully connected to the WebSocket.");
  }

  chatSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);
    console.log(data)

    if (data) {
      addMessage(data.sender_username, '/static/images/kirby.png', data.message, data.timestamp)
    }
  };

  chatSocket.onclose = function (e) {
    if (inFriendsPage) {
      console.error('WebSocket connection closed unexpectedly. Trying to reconnect in 2 seconds');
      setTimeout(function () {
        console.log("Reconnecting...")
        connectChat()
      }, 2000)
    } else {
      console.log('WebSocket connection closed');
    }
  };

  chatSocket.onerror = function (err) {
    console.log("WebSocket encountered an error: " + err.message);
    console.log("Closing the socket.");
    chatSocket.close();
  }
}

export function closeChatSocket() {
  if (chatSocket && (chatSocket.readyState === WebSocket.OPEN)) {
    chatSocket.close()
  }
}
