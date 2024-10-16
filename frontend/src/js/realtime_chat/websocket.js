import { addMessage } from "./chat_utils.js";

export let chatSocket = null

export function connect(receiverUsername) {
  console.log('receiverUsername: ', receiverUsername)
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

    // scrollup function
  };

  chatSocket.onclose = function (e) {
    console.error('WebSocket connection closed unexpectedly. Trying to reconnect in 2 seconds');
    // setTimeout(function () {
    //   console.log("Reconnecting...")
    //   connect()
    // }, 2000)
  };

  chatSocket.onerror = function (err) {
    console.log("WebSocket encountered an error: " + err.message);
    console.log("Closing the socket.");
    chatSocket.close();
  }
}
