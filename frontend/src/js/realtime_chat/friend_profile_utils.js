import { getUsername, setOnlineStatus } from "../global_vars.js"
import { loadUserAvatar } from "../settings/upload_avatar.js"
import { truncateString } from "../ui_utils/ui_utils.js"

export function loadFriendProfile(userId) {
  const profileContainer = document.querySelector('.profile-container')
  const avatar = document.querySelector('.profile-container .profile-settings-avatar')
  const statusBadge = document.querySelector('.profile-container .status-badge')
  const usernameDiv = document.querySelector('.profile-container .username')
  const pvpUsersLabel = document.querySelector('.profile-container .pvp-users-label')
  const pvpTallyLabel = document.querySelector('.profile-container .pvp-tally-label')

  const friendUsername = getUsername(userId)

  profileContainer.id = `profile-container-${userId}`

  loadUserAvatar(avatar, userId)
  setOnlineStatus(statusBadge, userId)

  usernameDiv.innerHTML = friendUsername
  usernameDiv.classList.add('no-scrollbar')
  pvpUsersLabel.innerHTML = `You vs ${truncateString(friendUsername, 12)}`
}

