import { getRequest, postRequest } from "./network_utils/api_requests.js";
import { currentUserInfo } from "./global_vars.js"
import { getAccessToken } from "./network_utils/token_utils.js";
import { loadContentToTarget } from "./ui_utils/ui_utils.js";
import { setCurrentDiv } from "./play_panel.js";

var lobbySocket = null
var inLobby = false
var lobbyType = ''
var lobbyUsers = []

export function getInLobby() {
  return inLobby
}

export async function createLobby() {
  const response = await postRequest('/api/lobby/create_lobby/')
  if (response.success) {
    return response.lobby_id
  }

  return null
}

export async function joinLobby(id) {
  lobbySocket = new WebSocket(`ws://localhost:8000/ws/lobby/${id}`, ['Authorization', getAccessToken()])
  lobbySocket.onmessage = async (e) => {
    const data = JSON.parse(e.data)
    console.log(data)

    switch (data.event) {
    case 'left':
      for (let i = 0; i < lobbyUsers.length; i++) {
        if (lobbyUsers[i].id != data.user) {
          continue
        }

        lobbyUsers.splice(i, 1)
        updateClassicLobby()
        break
      }
      break

    case 'join':
      const response = await getRequest(`/api/users/${data.user}/`)
      lobbyUsers.push(response)
      if (lobbyType == 'classic') {
        updateClassicLobby()
      }
      break

    case 'list':
      lobbyUsers = data.list // we do this to reserve space :]
      for (let i = 0; i < data.list.length; i++) {
        const response = await getRequest(`/api/users/${data.list[i]}/`)
        lobbyUsers[i] = response
      }
      updateClassicLobby()

    case 'ready':
      break

    case 'start':
      break

    case 'close':
      break

    case 'match':
      break
    }
  }

  lobbySocket.onclose = (e) => {
    lobbySocket = false
    inLobby = false
    lobbyType = ''
  }

  lobbySocket.onopen = () => {}
}

export async function leaveLobby() {
  lobbySocket.close()
}

export function initClassicLobby(previousDiv) {
  // init self
  document.getElementById('lobbyback').onclick = () => {
    leaveLobby()
    setCurrentDiv(document.getElementById('play-lobby-container'), previousDiv)
  }
  document.getElementById('start-game').onclick = () => {}

  inLobby = true
  lobbyType = 'classic'
}

export function updateClassicLobby() {
  try {
    setPlayerInfo(lobbyUsers[0], 'p1')
    setPlayerInfo(lobbyUsers[1], 'p2')
  } catch (e) {
  }
}

function setPlayerInfo(info, prefix) {
  if (typeof(info) != 'object') {
    return
  }

  const avatar = document.getElementById(`${prefix}-avatar`)
  const name = document.getElementById(`${prefix}-name`)
  if (info.avatar_img == null) {
    avatar.src = "/static/images/kirby.png";
  } else {
    avatar.setAttribute('src', info.avatar_img)
  }
  name.textContent = info.username
}

export async function populateLobbyList() {
  const buttonJoinLobby = async (e) => {
    await loadContentToTarget('menu/lobby_classic_content.html', 'play-lobby-container')

    const lobbyID = parseInt(e.target.id.substring('lobby-entry-'.length))
    await joinLobby(lobbyID)

    const prevDiv = document.getElementById('play-settings-container')
    initClassicLobby(prevDiv)
    setCurrentDiv(prevDiv, document.getElementById('play-lobby-container'))
  }
  const lobbyList = document.getElementById('lobby-list')
  const lobbyInfos = await getRequest('/api/lobby/get_lobbies/')
  for (const lobby of lobbyInfos) {
    if (lobby.closed) {
      continue
    }

    const userInfo = await getRequest(`/api/users/${lobby.host_id}/`)
    const lobbyContainer = document.createElement('button')
    lobbyContainer.classList.add('lobby-entry-container')
    lobbyContainer.id = `lobby-entry-${lobby.id}`
    lobbyContainer.onclick = buttonJoinLobby

    const lobbyIcon = document.createElement('img')
    lobbyIcon.classList.add('profile-settings-avatar')
    if (userInfo.avatar_img == null) {
      lobbyIcon.src = "/static/images/kirby.png";
    } else {
      lobbyIcon.setAttribute('src', userInfo.avatar_img)
    }

    const lobbyName = document.createElement('p')
    lobbyName.textContent = `${userInfo.username}'s Lobby`

    lobbyContainer.appendChild(lobbyIcon)
    lobbyContainer.appendChild(lobbyName)
    lobbyList.appendChild(lobbyContainer)
  }
}
