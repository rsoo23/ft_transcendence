import { currentUserInfo, getUserId, setOnlineStatus } from "../global_vars.js";
import { getRequest } from "../network_utils/api_requests.js";
import { loadUserAvatar } from "../settings/upload_avatar.js";
import { hideOverlay, showOverlay } from "../ui_utils/overlay_utils.js";
import { scrollToBottom } from "../ui_utils/scroll.js";
import { addEventListenerTo, addTextPlaceholder, loadContentToTarget } from "../ui_utils/ui_utils.js";
import { loadFriendProfile } from "./friend_profile_utils.js";
import { chatSocket, connectChat } from "./websocket.js";

let hasMessages = false
export let currentChatUserId = -1

// loads the chat interface containing the chat history and friend profile
export async function loadChatInterface(userId) {
  currentChatUserId = userId

  await loadContentToTarget('menu/chat_interface.html', 'friends-content-container')

  if (await isFriendBlocked(userId)) {
    showOverlay('chat-interface-overlay', 'You are blocked by this user')
    return
  }

  showOverlay('chat-interface-overlay', 'Loading...')

  // connect to chat websocket
  connectChat(userId)

  // load all messages
  await loadChatMessages(userId)

  initChatInput()

  // load friend profile
  loadFriendProfile(userId)
  hideOverlay('chat-interface-overlay')
}

async function isFriendBlocked(userId) {
  try {
    const response = await getRequest(`/api/is_friend_blocked/?receiver_id=${userId}`)

    console.log('is friend ', userId, ' blocked: ', response.is_blocked)
    if (response.is_blocked === 'true') {
      return true
    }
    return false
  } catch (error) {
    console.error('Error in isFriendBlocked: ', error)
  }
}

async function loadChatMessages(userId) {
  try {
    const response = await getRequest(`/api/chat_messages/?receiver_id=${userId}`)

    console.log('chat messages: ', response)
    if (response.detail === 'No Room matches the given query.') {
      return
    } else if (response.length === 0) {
      hasMessages = false
      addTextPlaceholder('chat-content-container', 'No chat messages yet')
    } else if (response.length > 0) {
      hasMessages = true
      response.map(message => addMessage(message.sender_username, message.content, message.timestamp))
      scrollToBottom('chat-content-container')
    }
  } catch (error) {
    console.error('Error in loadChatMessages: ', error)
  }
}

function initChatInput() {
  let chatInput = document.getElementById('chat-input')
  let sendMessageButton = document.getElementById('send-message-button')

  // focus 'chat-input' when user opens the page
  chatInput.focus();

  // submit message if the user presses the enter key
  chatInput.onkeyup = function (e) {
    if (e.key === 13) {  // enter key
      sendMessageButton.click();
    }
  };

  addEventListenerTo(
    sendMessageButton,
    'click',
    () => {
      if (chatInput.value.length > 0) {
        sendMessage(chatInput)
      }
    }
  )
}

function sendMessage(chatInputElement) {
  chatSocket.send(
    JSON.stringify(
      {
        "message": chatInputElement.value,
        "sender_id": currentUserInfo.id,
      }
    )
  );
  chatInputElement.value = "";
}

export function addMessage(username, message, datetime) {
  const userId = getUserId(username)

  const chatMessageContainer = document.createElement('div');
  chatMessageContainer.classList.add('chat-message-container');

  const avatarContainer = document.createElement('div');
  avatarContainer.classList.add('avatar-container');

  const avatarImg = document.createElement('img');
  avatarImg.alt = 'avatar';
  avatarImg.classList.add('avatar');
  loadUserAvatar(avatarImg, userId)

  avatarContainer.appendChild(avatarImg);

  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message-container');

  const userDetails = document.createElement('div');
  userDetails.classList.add('user-details');

  const userNamePara = document.createElement('p');
  userNamePara.classList.add('username');
  userNamePara.textContent = username;

  const dateTimePara = document.createElement('p');
  dateTimePara.classList.add('message-datetime');
  dateTimePara.textContent = datetime;

  const messageContent = document.createElement('div')
  messageContent.classList.add('message-content')
  messageContent.textContent = message

  userDetails.appendChild(userNamePara);
  userDetails.appendChild(dateTimePara);

  messageContainer.appendChild(userDetails);
  messageContainer.appendChild(messageContent)

  chatMessageContainer.appendChild(avatarContainer);
  chatMessageContainer.appendChild(messageContainer);

  const chatContentContainer = document.getElementById('chat-content-container')

  if (!hasMessages) {
    chatContentContainer.replaceChildren(chatMessageContainer);
    chatContentContainer.style.justifyContent = ''
    chatContentContainer.style.alignItems = ''
    hasMessages = true
  } else {
    chatContentContainer.appendChild(chatMessageContainer);
  }

  scrollToBottom('chat-content-container')
}

