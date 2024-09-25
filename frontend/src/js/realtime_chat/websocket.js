
let chatSocket = null

function connect() {
  const roomName = 'hello'
  chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/chat/'
    + roomName
    + '/'
  )

  chatSocket.onopen = function (e) {
    console.log("Successfully connected to the WebSocket.");
  }

  chatSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);
    console.log(data)

    switch (data.type) {
      case "chat_message":
        // chatLog.value += data.message + "\n";
        // add your chat message container instantiation 
        break;
      default:
        console.error("Unknown message type!");
        break;
    }
  };

  chatSocket.onclose = function (e) {
    console.error('WebSocket connection closed unexpectedly. Trying to reconnect in 2 seconds');
    setTimeout(function () {
      console.log("Reconnecting...")
      connect()
    }, 2000)
  };

  chatSocket.onerror = function (err) {
    console.log("WebSocket encountered an error: " + err.message);
    console.log("Closing the socket.");
    chatSocket.close();
  }
}

connect()
