
import { addEventListenerTo, loadContentToTarget } from "./ui_utils/ui_utils.js"
import { getColor } from "./ui_utils/color_utils.js"
import { getRequest, postRequest } from "./network_utils/api_requests.js"
import { friendRecordIconInfo } from "./global_vars.js"
import { loadChatInterface } from "./realtime_chat/chat_utils.js"

export function initAddFriendButton() {
  const button = document.getElementById('add-friend-button')
  const icon = document.getElementById('add-friend-icon')
  const colorName = 'blue'

  addEventListenerTo(
    button,
    'click',
    async () => {
      await loadContentToTarget('menu/friend_search_panel.html', 'friends-container')
      initCloseSearchFriendButton()
      await loadFriendSearchContent()
    }
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
    async () => {
      await loadContentToTarget('menu/friend_list_panel.html', 'friends-container')
      initAddFriendButton()
      await loadFriendListContent()
    }
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

  await loadUsersToList('/api/friends/', friendsList, friendRecordIconInfo['added'])
  await loadUsersToList('/api/blocked_friends/', blockedList, friendRecordIconInfo['blocked'])
}

async function loadFriendSearchContent() {
  const sentFriendRequestsList = document.querySelector('.friends-section.sent-friend-requests .friend-records')
  const receivedFriendRequestsList = document.querySelector('.friends-section.received-friend-requests .friend-records')
  const notAddedList = document.querySelector('.friends-section.not-added .friend-records')

  sentFriendRequestsList.innerHTML = ''
  receivedFriendRequestsList.innerHTML = ''
  notAddedList.innerHTML = ''

  await loadSentFriendRequestsToList('/api/sent_friend_requests/', sentFriendRequestsList)
  await loadReceivedFriendRequestsToList('/api/received_friend_requests/', receivedFriendRequestsList)
  await loadUsersToList('/api/non_friends/', notAddedList, friendRecordIconInfo['not-added'])
}

async function loadSentFriendRequestsToList(endpoint, targetList) {
  try {
    const response = await getRequest(endpoint)

    console.log(response)
    if (response.length === 0) {
      addListContentPlaceholderText('No requests sent', targetList)
    } else if (response.length > 0) {
      response.map(friend => {
        let friendRecordInstance = createFriendRecord(friend.receiver_username, friendRecordIconInfo['sent-friend-request'])

        targetList.appendChild(friendRecordInstance)
      })
      targetList.style.justifyContent = 'flex-start'
    } else {
      addListContentPlaceholderText('Error loading please try again', targetList)
    }
  } catch (error) {
    console.error('Error loading: ', error)
  }
}

async function loadReceivedFriendRequestsToList(endpoint, targetList) {
  try {
    const response = await getRequest(endpoint)

    console.log(response)
    if (response.length === 0) {
      addListContentPlaceholderText('No requests received', targetList)
    } else if (response.length > 0) {
      response.map(friend => {
        let friendRecordInstance = createFriendRecord(friend.sender_username, friendRecordIconInfo['received-friend-request'])

        targetList.appendChild(friendRecordInstance)
      })
      targetList.style.justifyContent = 'flex-start'
    } else {
      addListContentPlaceholderText('Error loading please try again', targetList)
    }
  } catch (error) {
    console.error('Error loading: ', error)
  }
}

async function loadUsersToList(endpoint, targetList, iconsInfo) {
  try {
    const response = await getRequest(endpoint)

    console.log(response)
    if (response.length === 0) {
      addListContentPlaceholderText('No users found', targetList)
    } else if (response.length > 0) {
      response.map(friend => {
        let friendRecordInstance = createFriendRecord(friend.username, iconsInfo)

        targetList.appendChild(friendRecordInstance)
      })
      targetList.style.justifyContent = 'flex-start'
    } else {
      addListContentPlaceholderText('Error loading please try again', targetList)
    }
  } catch (error) {
    console.error('Error loading: ', error)
  }
}

function addListContentPlaceholderText(labelText, targetList) {
  const listContentPlaceholderText = document.createElement('p')
  listContentPlaceholderText.className = 'list-content-placeholder-text'
  listContentPlaceholderText.textContent = labelText

  targetList.style.justifyContent = 'center'

  targetList.appendChild(listContentPlaceholderText)
}

function createFriendRecord(username, iconsInfo) {
  const avatarImageUrl = '/static/images/kirby.png'

  const friendRecord = document.createElement('div');
  friendRecord.className = 'friend-record';

  const avatarSection = document.createElement('div');
  avatarSection.className = 'avatar-section';

  const avatarContainer = document.createElement('div');
  avatarContainer.className = 'avatar-container';

  const avatarImage = document.createElement('img');
  avatarImage.src = avatarImageUrl;
  avatarImage.alt = 'avatar';
  avatarImage.className = 'avatar';

  const statusBadge = document.createElement('div');
  statusBadge.className = 'status-badge';

  const avatarName = document.createElement('div');
  avatarName.className = 'avatar-name';
  avatarName.textContent = username;

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

    initFriendRecordIcon(icon, iconInfo['icon-id'], username)
  })

  avatarContainer.appendChild(avatarImage);
  avatarContainer.appendChild(statusBadge);
  avatarSection.appendChild(avatarContainer);
  avatarSection.appendChild(avatarName);

  friendRecord.appendChild(avatarSection);
  friendRecord.appendChild(iconsSection);
  return friendRecord
}

function initFriendRecordIcon(icon, iconId, username) {
  let callback

  switch (iconId) {
    case 'challenge-icon':
      break
    case 'chat-icon':
      callback = (() => {
        return async () => loadChatInterface(username)
      })()
      break
    case 'block-icon':
      callback = async () => {
        try {
          const response = await postRequest('/api/block_friend/', { blocked_username: username })
          await loadFriendListContent()

          console.log(response)
        } catch (error) {
          console.error('Error :', error)
        }
      }
      break
    case 'unblock-icon':
      callback = async () => {
        try {
          const response = await postRequest('/api/unblock_friend/', { unblocked_username: username })
          await loadFriendListContent()

          console.log(response)
        } catch (error) {
          console.error('Error :', error)
        }
      }
      break
    case 'cancel-icon':
      callback = async () => {
        try {
          const response = await postRequest('/api/cancel_friend_request/', { receiver_username: username })
          await loadFriendSearchContent()

          console.log(response)
        } catch (error) {
          console.error('Error :', error)
        }
      }
      break
    case 'decline-icon':
      callback = async () => {
        try {
          const response = await postRequest('/api/decline_friend_request/', { sender_username: username })
          await loadFriendSearchContent()

          console.log(response)
        } catch (error) {
          console.error('Error :', error)
        }
      }
      break
    case 'accept-icon':
      callback = async () => {
        try {
          const response = await postRequest('/api/accept_friend_request/', { sender_username: username })
          await loadFriendSearchContent()

          console.log(response)
        } catch (error) {
          console.error('Error :', error)
        }
      }
      break
    case 'send-friend-request-icon':
      callback = async () => {
        try {
          const response = await postRequest('/api/send_friend_request/', { receiver_username: username })
          await loadFriendSearchContent()

          console.log(response)

        } catch (error) {
          console.error('Error :', error)
        }
      }
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

