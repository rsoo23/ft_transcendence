
let chatInput = document.getElementById('chat-input')
let sendMessageButton = document.getElementById('send-message-button')

// focus 'chat-input' when user opens the page
chatInput.focus();

// submit if the user presses the enter key
chatInput.onkeyup = function (e) {
  if (e.keyCode === 13) {  // enter key
    sendMessageButton.click();
  }
};

// clear the 'chatInput' and forward the message
sendMessageButton.onclick = function () {
  if (chatInput.value.length === 0) return;
  chatSocket.send(JSON.stringify({
    "message": chatInput.value,
  }));
  // addMessage(data.user, avatarUrl, data.message, datetime)
  chatInput.value = "";
};

function addMessage(username, avatarUrl, message, datetime) {
  // Create the main container div
  const chatMessageContainer = document.createElement('div');
  chatMessageContainer.classList.add('chat-message-container');

  // Create the avatar container
  const avatarContainer = document.createElement('div');
  avatarContainer.classList.add('avatar-container');

  const avatarImg = document.createElement('img');
  avatarImg.src = avatarUrl;
  avatarImg.alt = 'avatar';
  avatarImg.classList.add('avatar');

  const statusBadge = document.createElement('div');
  statusBadge.classList.add('status-badge');

  avatarContainer.appendChild(avatarImg);
  avatarContainer.appendChild(statusBadge);

  // Create the message container
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message-container');

  // Create user details div
  const userDetails = document.createElement('div');
  userDetails.classList.add('user-details');

  const userNamePara = document.createElement('p');
  userNamePara.classList.add('username');
  userNamePara.textContent = username;

  const dateTimePara = document.createElement('p');
  dateTimePara.classList.add('message-datetime');
  dateTimePara.textContent = datetime;

  userDetails.appendChild(userNamePara);
  userDetails.appendChild(dateTimePara);

  // Append user details and message content to message container
  messageContainer.appendChild(userDetails);
  messageContainer.appendChild(document.createTextNode(message));

  // Append avatarContainer and messageContainer to the main container
  chatMessageContainer.appendChild(avatarContainer);
  chatMessageContainer.appendChild(messageContainer);

  // Append the newly created message div to the chat-messages container
  document.getElementById('chat-content-container').appendChild(chatMessageContainer);
}

