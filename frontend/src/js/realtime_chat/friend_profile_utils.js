import { currentUserInfo, getUsername, setOnlineStatus } from "../global_vars.js"
import { getRequest } from "../network_utils/api_requests.js"
import { loadUserAvatar } from "../settings/upload_avatar.js"
import { truncateString } from "../ui_utils/ui_utils.js"

export async function loadFriendProfile(userId) {
  const profileContainer = document.querySelector('.profile-container')
  const avatar = document.querySelector('.profile-container .profile-settings-avatar')
  const statusBadge = document.querySelector('.profile-container .status-badge')
  const usernameDiv = document.querySelector('.profile-container .username')
  const pvpUsersLabel = document.querySelector('.profile-container .pvp-users-label')

  const friendUsername = getUsername(userId)

  profileContainer.id = `profile-container-${userId}`

  loadUserAvatar(avatar, userId)
  setOnlineStatus(statusBadge, userId)

  usernameDiv.innerHTML = friendUsername
  usernameDiv.classList.add('no-scrollbar')
  pvpUsersLabel.innerHTML = `You vs ${truncateString(friendUsername, 12)}`

  await getPvpTally(userId)
  await getUserTotalTally(userId)
}


async function getPvpTally(friendUserId) {
  try {
    const url = `/api/game_stats/pvp_tally/${currentUserInfo.id}/${friendUserId}/`
    const response = await getRequest(url)

    setPvpTallyBar(response)
  } catch (error) {
    console.error(error)
  }
}

function setPvpTallyBar(response) {
  const pvpTallyLabel = document.querySelector('.profile-container .pvp-tally-label')
  const winBar = document.querySelector('.pvp-stat-container .win-bar')
  const loseBar = document.querySelector('.pvp-stat-container .lose-bar')
  const totalGames = response.wins + response.losses

  const winRatio = totalGames === 0 ? 50 : Math.round(response.wins / totalGames * 100)
  const loseRatio = 100 - winRatio

  winBar.style.width = `${winRatio}%`
  loseBar.style.width = `${loseRatio}%`

  if (response.wins === totalGames) {
    winBar.style.borderRadius = '0.5rem'
  }
  if (response.losses === totalGames) {
    loseBar.style.borderRadius = '0.5rem'
  }
  if (response.wins === 0 && response.losses === 0) {
    winBar.style.borderRadius = '0.5rem 0 0 0.5rem'
    loseBar.style.borderRadius = '0 0.5rem 0.5rem 0'
  }

  pvpTallyLabel.innerHTML = `${response.wins} - ${response.losses}`
}


async function getUserTotalTally(friendUserId) {
  try {
    const url = `/api/game_stats/user_total_tally/${friendUserId}/`
    const response = await getRequest(url)

    setUserTotalTally(response)
  } catch (error) {
    console.error(error)
  }
}

function setUserTotalTally(response) {
  const userTallyLabel = document.querySelector('.profile-container .total-tally-label')
  const winBar = document.querySelector('.total-game-stat-container .win-bar')
  const loseBar = document.querySelector('.total-game-stat-container .lose-bar')
  const totalGames = response.wins + response.losses

  const winRatio = totalGames === 0 ? 50 : Math.round(response.wins / totalGames * 100)
  const loseRatio = 100 - winRatio

  winBar.style.width = `${winRatio}%`
  loseBar.style.width = `${loseRatio}%`

  if (response.wins === totalGames) {
    winBar.style.borderRadius = '0.5rem'
  }
  if (response.losses === totalGames) {
    loseBar.style.borderRadius = '0.5rem'
  }

  userTallyLabel.innerHTML = `${response.wins} - ${response.losses}`
}

