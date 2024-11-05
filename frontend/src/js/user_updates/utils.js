import { currentUserInfo, PAGE_STATE, setOnlineStatus, usersInfo } from "../global_vars.js";

export function handleUsernameUpdate(data) {
  if (data.message === 'username already exists') {
    alert("Username already exists")
    return
  }

  // if the user updated their own username, update currentUserInfo
  // else update usersInfo
  if (data.user_id === currentUserInfo.id) {
    currentUserInfo.username = data.new_username
  } else {
    for (let key in usersInfo) {
      if (usersInfo[key].id === data.user_id) {
        usersInfo[key].username = data.new_username
        break;
      }
    }
  }
}

export function handleOnlineStatusUpdate(data) {
  // if the user updated their own username, update currentUserInfo
  // else update usersInfo
  if (data.user_id === currentUserInfo.id) {
    currentUserInfo.is_online = data.is_online
  } else {
    for (let key in usersInfo) {
      if (usersInfo[key].id === data.user_id) {
        usersInfo[key].is_online = data.is_online
        break;
      }
    }
  }
}

export function handleStatusBadges(data) {
  const userId = data.user_id

  if (PAGE_STATE.IN_FRIENDS_PAGE) {
    const friendRecordStatusBadge = document.querySelector(`#friend-record-${userId} .status-badge`)
    const friendProfileStatusBadge = document.querySelector(`#profile-container-${userId} .status-badge`)

    if (friendRecordStatusBadge) {
      setOnlineStatus(friendRecordStatusBadge, userId)
    }
    if (friendProfileStatusBadge) {
      setOnlineStatus(friendProfileStatusBadge, userId)
    }
  }
}
