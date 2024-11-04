import { getRequest, postRequest } from "./network_utils/api_requests.js";
import { currentUserInfo } from "./global_vars.js"
import { getAccessToken } from "./network_utils/token_utils.js";
import { loadContentToTarget } from "./ui_utils/ui_utils.js";
import { setCurrentDiv } from "./play_panel.js";
import { queueNotification } from "./ui_utils/notification_utils.js";
import { loadPage } from "./router.js";
import { joinMatch } from "./game/api.js";

var lobbySocket = null
var lobbyListSocket = null
var lobbyListEntries = 0
var inLobby = false
var lobbyType = ''
var lobbyUsers = []
var lobbyStarting = false

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
      response['ready'] = false
      lobbyUsers.push(response)
      queueNotification('teal', `${response.username} has joined the lobby.`, () => {})
      if (lobbyType == 'classic') {
        updateClassicLobby()
      }
      break

    case 'list':
      lobbyUsers = data.list // we do this to reserve space :]
      for (let i = 0; i < data.list.length; i++) {
        const user = data.list[i]
        const response = await getRequest(`/api/users/${user.id}/`)
        response['ready'] = user.ready
        lobbyUsers[i] = response
      }
      updateClassicLobby()

    case 'ready':
      for (const user of lobbyUsers) {
        if (user.id != data.user) {
          continue
        }

        user.ready = data.ready
      }
      updateClassicLobby()
      break

    case 'start':
      lobbyStarting = true
      queueNotification('teal', 'Game starting...', () => {})
      updateClassicLobby()
      break

    case 'close':
      break

    case 'match':
      await loadPage('game')
      joinMatch(data.id)
      break
    }
  }

  lobbySocket.onclose = (e) => {
    lobbySocket = null

    if (e.code == 1006) {
      queueNotification('magenta', 'Lobby is no longer available.', () => {})
    } else if (e.code == 4001) {
      queueNotification('magenta', 'Lobby has been closed by host.', () => {})
    } else if (e.code == 4002) {
      queueNotification('magenta', 'Lobby is full.', () => {})
    }

    // copied from router.js
    const path = window.location.pathname;
    if (path.startsWith('/menu/play') && inLobby) {
      leaveLobby()
    }
  }

  lobbySocket.onopen = () => {}
}

var lobbyBackButtonDivCache = null
export function leaveLobby() {
  inLobby = false
  lobbyType = ''
  lobbyUsers = []
  lobbyStarting = false
  if (document.getElementById('lobby-list') != null) {
    initLobbyList()
  }
  if (lobbySocket != null) {
    lobbySocket.close()
  }

  setCurrentDiv(document.getElementById('play-lobby-container'), lobbyBackButtonDivCache)
}

export function initClassicLobby(previousDiv) {
  // init self
  lobbyBackButtonDivCache = previousDiv
  document.getElementById('lobbyback').onclick = () => leaveLobby()

  const readyButton = (e) => {
    const value = (e.target.textContent != 'Unready')
    lobbySocket.send(JSON.stringify({
      'action': 'ready',
      'value': value,
    }))
  }
  document.getElementById('p1-ready').onclick = readyButton;
  document.getElementById('p2-ready').onclick = readyButton;

  document.getElementById('start-game').onclick = () => lobbySocket.send('{"action": "start"}')

  inLobby = true
  lobbyType = 'classic'
}

export function updateClassicLobby() {
  const path = window.location.pathname;
  if (!path.startsWith('/menu/play')) {
    return
  }

  if (lobbyUsers.length > 0) {
    setPlayerInfo(lobbyUsers[0], 'p1')
  } else {
    setPlayerInfo(null, 'p1')
  }

  if (lobbyUsers.length > 1) {
    setPlayerInfo(lobbyUsers[1], 'p2')
  } else {
    setPlayerInfo(null, 'p2')
  }

  const startGameContainer = document.getElementById('start-game-container')
  const startButton = document.getElementById('start-game')
  if (lobbyStarting) {
    const p = document.createElement('p')
    p.textContent = 'Starting game...'
    startGameContainer.innerHTML = ''
    startGameContainer.appendChild(p)
  } else if (lobbyUsers.length > 0 && lobbyUsers[0].id != currentUserInfo.id) {
    startButton.setAttribute('disabled', 'true')
    startButton.style.setProperty('visibility', 'hidden')
    startButton.onclick = () => {}
  } else if (lobbyUsers.length == 1 && lobbyUsers[0].id == currentUserInfo.id) {
    startButton.setAttribute('disabled', 'true')
  } else if (lobbyUsers[0].id == currentUserInfo.id) {
    startButton.removeAttribute('disabled')
  }
}

function setPlayerInfo(info, prefix) {
  const avatar = document.getElementById(`${prefix}-avatar`)
  const name = document.getElementById(`${prefix}-name`)
  const header = document.getElementById(`${prefix}-header`)
  const ready = document.getElementById(`${prefix}-ready`)
  if (info == null || !("username" in info)) {
    avatar.style.setProperty('display', 'none')
    avatar.src = '';
    header.style.setProperty('display', 'none')
    ready.style.setProperty('display', 'none')
    name.textContent = 'Waiting for user...'
    return
  }

  if (info.avatar_img == null) {
    avatar.src = "/static/images/kirby.png";
  } else {
    avatar.setAttribute('src', info.avatar_img)
  }
  avatar.style.setProperty('display', 'block')
  header.style.setProperty('display', 'block')
  ready.style.setProperty('display', 'block')
  name.textContent = info.username
  
  if (info.id != currentUserInfo.id) {
    ready.setAttribute('disabled', 'true')
    if (info.ready) {
      ready.textContent = 'Ready'
    } else {
      ready.textContent = 'Not Ready'
    }
  } else {
    if (info.ready) {
      ready.textContent = 'Unready'
      ready.style.setProperty('background-color', 'var(--magenta-500)')
    } else {
      ready.textContent = 'Ready'
      ready.style.setProperty('background-color', 'var(--teal-500)')
    }
  }
}

export async function initLobbyList() {
  document.getElementById('lobby-list').innerHTML = ''
  lobbyListSocket = new WebSocket('ws://localhost:8000/ws/lobby_list/', ['Authorization', getAccessToken()])
  lobbyListSocket.onmessage = (e) => {
    const data = JSON.parse(e.data)

    switch (data.event) {
    case 'receive':
      appendLobbyEntry(data.id)
      break

    case 'remove':
      removeLobbyEntry(data.id)
      break
    }
  }

  lobbyListSocket.onclose = () => {
    console.log('Closing lobbyListSocket')
    lobbyListSocket = null
  }

  lobbyListSocket.onopen = () => {
    lobbyListSocket.send('{"action": "get"}')
  }

  setTimeout(tryShowNoLobbies, 1000)
}

export function closeLobbyListSocket() {
  if (lobbyListSocket != null && (lobbyListSocket.readyState === WebSocket.OPEN)) {
    lobbyListSocket.close()
  }
}

async function appendLobbyEntry(lobbyId) {
  const buttonJoinLobby = async (e) => {
    const target = e.currentTarget
    const substr = target.id.substring('lobby-entry-'.length)
    const lobbyID = Number(substr)
    await loadContentToTarget('menu/lobby_classic_content.html', 'play-lobby-container')
    await joinLobby(lobbyID)

    const prevDiv = document.getElementById('play-settings-container')
    initClassicLobby(prevDiv)
    closeLobbyListSocket()
    setCurrentDiv(prevDiv, document.getElementById('play-lobby-container'))
  }

  const lobbyList = document.getElementById('lobby-list')
  if (lobbyList == null) {
    return
  }

  const lobbyInfo = await getRequest(`/api/lobby/get_lobby/${lobbyId}/`)
  const userInfo = await getRequest(`/api/users/${lobbyInfo.host_id}/`)
  const lobbyContainer = document.createElement('button')
  lobbyContainer.classList.add('lobby-entry-container')
  lobbyContainer.id = `lobby-entry-${lobbyInfo.id}`
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

  tryShowNoLobbies()
}

async function removeLobbyEntry(lobbyId) {
  const lobbyList = document.getElementById('lobby-list')
  if (lobbyList == null) {
    return
  }

  const entry = document.getElementById(`lobby-entry-${lobbyId}`)
  if (entry != null) {
    lobbyList.removeChild(entry)
  }

  tryShowNoLobbies()
}

function tryShowNoLobbies() {
  const lobbyList = document.getElementById('lobby-list')
  if (lobbyList == null) {
    return
  }

  if (lobbyList.childElementCount == 0) {
    const div = document.createElement('div')
    const p = document.createElement('p')
    div.id = 'lobby-empty-text'
    div.classList.add('lobby-empty-container')
    p.textContent = 'No lobbies available.'
    div.appendChild(p)
    lobbyList.appendChild(div)
  } else {
    const div = document.getElementById('lobby-empty-text')
    if (div != null) {
      lobbyList.removeChild(div)
    }
  }
}
