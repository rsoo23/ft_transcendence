
import { addEventListenerTo, loadContentToTarget } from "./ui_utils/ui_utils.js"
import { getColor } from "./ui_utils/color_utils.js"
import { getRequest } from "./network_utils/api_requests.js"

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
      await loadFriendsList()
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

export async function loadFriendsList() {
  // const addedList = document.querySelector('.friends-section.added')
  // const pendingList = document.querySelector('.friends-section.pending')
  // const blockedList = document.querySelector('.friends-section.blocked')
  const friendSearchList = document.querySelector('.scrollable-container.friend-search')

  try {
    const response = await getRequest('/api/users/')

    if (response.length === 0) {
      addListContentPlaceholderText('No users exist yet', friendSearchList)
    } else {
      response.map(friend => addFriendRecord(friend, friendSearchList))
    }
  } catch (error) {
    console.error('Error loading friends list: ', error)
  }
}

function addListContentPlaceholderText(labelText, targetList) {
  const listContentPlaceholderText = document.createElement('p')
  listContentPlaceholderText.className = 'list-content-placeholder-text'
  listContentPlaceholderText.textContent = labelText

  targetList.style.justifyContent = 'center'

  targetList.appendChild(listContentPlaceholderText)
}

function addFriendRecord(friendInfo, targetList) {
  const username = friendInfo.username
  const avatarImageUrl = '/static/images/kirby.png'
  const iconName = 'person_add'
  const tooltipText = 'Send friend request'

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

  const unblockIcon = document.createElement('i');
  unblockIcon.id = 'unblock-icon';
  unblockIcon.className = 'material-icons icon-with-tooltip';
  unblockIcon.textContent = iconName;

  const unblockTooltip = document.createElement('div');
  unblockTooltip.id = 'unblock-tooltip';
  unblockTooltip.className = 'icon-tooltip';
  unblockTooltip.textContent = tooltipText;

  avatarContainer.appendChild(avatarImage);
  avatarContainer.appendChild(statusBadge);
  avatarSection.appendChild(avatarContainer);
  avatarSection.appendChild(avatarName);
  unblockIcon.appendChild(unblockTooltip);
  iconsSection.appendChild(unblockIcon);

  friendRecord.appendChild(avatarSection);
  friendRecord.appendChild(iconsSection);

  targetList.style.justifyContent = 'flex-start'
  targetList.appendChild(friendRecord)
}

