
import { addEventListenerTo, loadContentToTarget, truncateString } from "../ui_utils/ui_utils.js"
import { getRequest, postRequest } from "../network_utils/api_requests.js"
import { friendRecordIconInfo, getUserId, setOnlineStatus, usersInfo } from "../global_vars.js"
import { friendsSystemSocket } from "./websocket.js"
import { loadChatInterface } from "../realtime_chat/chat_utils.js"
import { loadUsersInfo } from "../router.js"
import { loadUserAvatar } from "../settings/upload_avatar.js"
import { getColor } from "../ui_utils/color_utils.js"

export const FRIEND_LIST_STATE = {
  SHOWING_FRIEND_LIST: 0,
  SHOWING_FRIEND_SEARCH_LIST: 1,
}

export let currentFriendListState = FRIEND_LIST_STATE.SHOWING_FRIEND_LIST

export async function loadFriendListPanel() {
  await loadUsersInfo()
  currentFriendListState = FRIEND_LIST_STATE.SHOWING_FRIEND_LIST
  await loadContentToTarget('menu/friend_list_panel.html', 'friends-container')
  initAddFriendButton()
  await loadFriendListContent()
}

export async function loadFriendSearchPanel() {
  await loadUsersInfo()
  currentFriendListState = FRIEND_LIST_STATE.SHOWING_FRIEND_SEARCH_LIST
  await loadContentToTarget('menu/friend_search_panel.html', 'friends-container')
  initCloseSearchFriendButton()
  await loadFriendSearchContent()
}

export function initAddFriendButton() {
  const button = document.getElementById('add-friend-button')
  const icon = document.getElementById('add-friend-icon')
  const colorName = 'blue'

  addEventListenerTo(
    button,
    'click',
    async () => loadFriendSearchPanel()
  )

  addEventListenerTo(
    button,
    'mouseover',
    () => {
      button.style.backgroundColor = getColor(colorName, 700)
      icon.style.color = getColor(colorName, 400)
    }
  )

  addEventListenerTo(
    button,
    'mouseout',
    () => {
      button.style.backgroundColor = getColor(colorName, 500)
      icon.style.color = getColor(colorName, 200)
    }
  )

  addEventListenerTo(
    button,
    'mousedown',
    () => {
      button.style.backgroundColor = getColor(colorName, 800)
      icon.style.color = getColor(colorName, 500)
    }
  )

  addEventListenerTo(
    button,
    'mouseup',
    () => {
      button.style.backgroundColor = getColor(colorName, 700)
      icon.style.color = getColor(colorName, 400)
    }
  )
}

export function initCloseSearchFriendButton() {
  const button = document.getElementById('close-search-friend-button')
  const icon = document.getElementById('close-search-friend-icon')
  const colorName = 'blue'

  addEventListenerTo(
    button,
    'click',
    async () => loadFriendListPanel()
  )

  addEventListenerTo(
    button,
    'mouseover',
    () => {
      button.style.backgroundColor = getColor(colorName, 700)
      icon.style.color = getColor(colorName, 400)
    }
  )

  addEventListenerTo(
    button,
    'mouseout',
    () => {
      button.style.backgroundColor = getColor(colorName, 500)
      icon.style.color = getColor(colorName, 200)
    }
  )

  addEventListenerTo(
    button,
    'mousedown',
    () => {
      button.style.backgroundColor = getColor(colorName, 800)
      icon.style.color = getColor(colorName, 500)
    }
  )

  addEventListenerTo(
    button,
    'mouseup',
    () => {
      button.style.backgroundColor = getColor(colorName, 700)
      icon.style.color = getColor(colorName, 400)
    }
  )
}

export async function loadFriendListContent() {
  const friendsList = document.querySelector('.friends-section.added .friend-records')
  const blockedList = document.querySelector('.friends-section.blocked .friend-records')

  friendsList.innerHTML = ''
  blockedList.innerHTML = ''

  await loadFriendRecordsToList(
    '/api/friends/',
    friendsList,
    friendRecordIconInfo['added'],
    'You have no friends'
  )
  await loadFriendRecordsToList(
    '/api/blocked_friends/',
    blockedList,
    friendRecordIconInfo['blocked'],
    'You have no blocked friends'
  )
}

export async function loadFriendSearchContent() {
  const sentFriendRequestsList = document.querySelector('.friends-section.sent-friend-requests .friend-records')
  const receivedFriendRequestsList = document.querySelector('.friends-section.received-friend-requests .friend-records')
  const notAddedList = document.querySelector('.friends-section.not-added .friend-records')

  sentFriendRequestsList.innerHTML = ''
  receivedFriendRequestsList.innerHTML = ''
  notAddedList.innerHTML = ''

  await loadFriendRecordsToList(
    '/api/sent_friend_requests/',
    sentFriendRequestsList,
    friendRecordIconInfo['sent-friend-request'],
    'No requests sent'
  )
  await loadFriendRecordsToList(
    '/api/received_friend_requests/',
    receivedFriendRequestsList,
    friendRecordIconInfo['received-friend-request'],
    'No requests received'
  )
  await loadFriendRecordsToList(
    '/api/non_friends/',
    notAddedList,
    friendRecordIconInfo['not-added'],
    'No users found'
  )
}

async function loadFriendRecordsToList(endpoint, targetList, iconsInfo, placeholderText) {
  try {
    const response = await getRequest(endpoint)

    if (response.length === 0) {
      addListContentPlaceholderText(placeholderText, targetList)
    } else if (response.length > 0) {
      renderFriendRecords(endpoint, response, targetList, iconsInfo)
    } else {
      addListContentPlaceholderText('Error loading please try again', targetList)
    }
  } catch (error) {
    console.error('Error loading: ', error)
  }
}

function renderFriendRecords(endpoint, friends, targetList, iconsInfo) {
  friends.map(friend => {
    let friendRecordInstance

    if (endpoint === '/api/sent_friend_requests/') {
      friendRecordInstance = createFriendRecord(friend.receiver_username, iconsInfo)
    } else if (endpoint === '/api/received_friend_requests/') {
      friendRecordInstance = createFriendRecord(friend.sender_username, iconsInfo)
    } else {
      friendRecordInstance = createFriendRecord(friend.username, iconsInfo)
    }

    targetList.appendChild(friendRecordInstance)
  })
  targetList.style.justifyContent = 'flex-start'
}

function addListContentPlaceholderText(labelText, targetList) {
  const listContentPlaceholderText = document.createElement('p')
  listContentPlaceholderText.className = 'list-content-placeholder-text'
  listContentPlaceholderText.textContent = labelText

  targetList.style.justifyContent = 'center'

  targetList.appendChild(listContentPlaceholderText)
}

function createFriendRecord(username, iconsInfo) {
  const userId = getUserId(username)

  const friendRecord = document.createElement('div');
  friendRecord.className = 'friend-record';
  friendRecord.id = `friend-record-${userId}`

  const avatarSection = document.createElement('div');
  avatarSection.className = 'avatar-section';

  const avatarContainer = document.createElement('div');
  avatarContainer.className = 'avatar-container';

  const avatarImage = document.createElement('img');
  avatarImage.className = 'avatar';
  loadUserAvatar(avatarImage, userId)

  const statusBadge = document.createElement('div');
  statusBadge.className = 'status-badge';
  setOnlineStatus(statusBadge, userId)

  const avatarName = document.createElement('div');
  avatarName.className = 'avatar-name';
  avatarName.textContent = truncateString(username, 9);

  const iconsSection = document.createElement('div');
  iconsSection.className = 'icons-section';

  iconsInfo.map(iconInfo => {
    const icon = document.createElement('i');
    icon.id = iconInfo['icon-id'];
    icon.className = 'material-icons icon-with-tooltip';
    icon.textContent = iconInfo['icon-name'];

    const tooltip = document.createElement('div');
    tooltip.id = 'send-friend-request-tooltip';
    tooltip.className = 'icon-tooltip';
    tooltip.textContent = iconInfo['tooltip-text'];

    icon.appendChild(tooltip);
    iconsSection.appendChild(icon);
    initFriendRecordIcon(icon, iconInfo['icon-id'], userId)
  })

  avatarContainer.appendChild(avatarImage);
  avatarContainer.appendChild(statusBadge);
  avatarSection.appendChild(avatarContainer);
  avatarSection.appendChild(avatarName);

  friendRecord.appendChild(avatarSection);
  friendRecord.appendChild(iconsSection);
  return friendRecord
}

function initFriendRecordIcon(icon, iconId, userId) {
  let callback

  switch (iconId) {
    case 'challenge-icon':
      break
    case 'chat-icon':
      callback = (() => {
        return async () => loadChatInterface(userId)
      })()
      break
    case 'send-friend-request-icon':
      callback = async () => sendToFriendSystemSocket({ action: 'send_friend_request', receiver_id: userId })
      break
    case 'cancel-icon':
      callback = async () => sendToFriendSystemSocket({ action: 'cancel_friend_request', receiver_id: userId })
      break
    case 'decline-icon':
      callback = async () => sendToFriendSystemSocket({ action: 'decline_friend_request', sender_id: userId })
      break
    case 'accept-icon':
      callback = async () => sendToFriendSystemSocket({ action: 'accept_friend_request', sender_id: userId })
      break
    case 'block-icon':
      callback = async () => sendToFriendSystemSocket({ action: 'block_friend', blocked_id: userId })
      break
    case 'unblock-icon':
      callback = async () => sendToFriendSystemSocket({ action: 'unblock_friend', unblocked_id: userId })
      break
    default:
      console.error("Error: Invalid iconId ", iconId)
  }
  addEventListenerTo(
    icon,
    'click',
    callback
  )
}

function sendToFriendSystemSocket(info) {
  friendsSystemSocket.send(JSON.stringify(info));
}

