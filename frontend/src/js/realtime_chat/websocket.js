

function initWebSocket() {
  const roomName = 'hello'
  const chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/chat/'
    + roomName
    + '/'
  )

  chatSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);
    // document.querySelector('#chat-log').value += (data.message + '\n');
    console.log(data)
  };

  chatSocket.onclose = function (e) {
    console.error('Chat socket closed unexpectedly');
  };

  // document.getElementById('#chat-message-submit').onclick = function (e) {
  //   const messageInputDom = document.querySelector('#chat-message-input');
  //   const message = messageInputDom.value;
  //   chatSocket.send(JSON.stringify({
  //     'message': message
  //   }));
  //   messageInputDom.value = '';
  // };
}

