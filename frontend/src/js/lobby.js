import { getRequest, postRequest } from "./network_utils/api_requests.js";
import { currentUserInfo } from "./global_vars.js"
import { getAccessToken } from "./network_utils/token_utils.js";
import { loadContentToTarget } from "./ui_utils/ui_utils.js";
import { divSwitcher } from "./play_panel.js";
import { queueNotification } from "./ui_utils/notification_utils.js";
import { loadPage } from "./router.js";
import { joinMatch, defaultMatchOnClose } from "./game/api.js";
import { initLobbyList } from "./lobby_list.js";
import { checkInTournament, checkIsTournamentOpponent, joinTournament } from "./tournament.js";

var lobbySocket = null
var inLobby = false
var lobbyType = ''
var lobbyUsers = []
var lobbyStarting = false

export function checkInLobby() {
  return inLobby
}

export function getLobbyType() {
  return lobbyType;
}

export function validateAvatarImg(src) {
  if (src == null) {
    return "/static/images/kirby.png"
  } else {
    return src
  }
}

export async function createLobby() {
  const response = await postRequest('/api/lobby/create_lobby/')
  if (response.success) {
    return response.lobby_id
  }

  console.log(response.reason)
  return null
}

export async function createTournamentLobby(maxUsers) {
  const response = await postRequest('/api/lobby/create_tournament_lobby/', { max_users: maxUsers })
  if (response.success) {
    return response.lobby_id
  }

  return null
}

export async function joinLobby(id) {
  lobbySocket = new WebSocket(`ws://${window.location.host}/ws/lobby/${id}`, ['Authorization', getAccessToken()])
  lobbySocket.onmessage = async (e) => {
    const data = JSON.parse(e.data)
    console.log(data)

    switch (data.event) {
    case 'left':
      for (let i = 0; i < lobbyUsers.length; i++) {
        if (lobbyUsers[i].id != data.user) {
          continue
        }

        const user = lobbyUsers[i]
        lobbyUsers.splice(i, 1)
        if (checkInTournament() && checkIsTournamentOpponent(user.id)) {
          queueNotification('magenta', `Your opponent(${user.username}) has left the tournament.`, () => {})
        } else {
          queueNotification('magenta', `${user.username} has left the lobby.`, () => {})
        }
        if (lobbyType == 'tournament') {
          removeTournamentUser(user)
          updateTournamentLobby()
        } else {
          updateClassicLobby()
        }
        break
      }
      break

    case 'join':
      const response = await getRequest(`/api/users/${data.user}/`)
      response['ready'] = false
      lobbyUsers.push(response)
      queueNotification('teal', `${response.username} has joined the lobby.`, () => {})
      if (lobbyType == 'tournament') {
        updateTournamentLobby()
      } else {
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
      if (lobbyType == 'tournament') {
        updateTournamentLobby()
      } else {
        updateClassicLobby()
      }

    case 'ready':
      for (const user of lobbyUsers) {
        if (user.id != data.user) {
          continue
        }

        user.ready = data.ready
      }
      if (lobbyType == 'tournament') {
        updateTournamentLobby()
      } else {
        updateClassicLobby()
      }
      break

    case 'start':
      lobbyStarting = true
      queueNotification('teal', 'Game starting...', () => {})
      if (lobbyType == 'tournament') {
        updateTournamentLobby()
      } else {
        updateClassicLobby()
      }
      break

    case 'close':
      break

    case 'match':
      if (data.p1 != currentUserInfo.id && data.p2 != currentUserInfo.id) {
        break
      }

      lobbySocket.onclose = null
      await loadPage('game')
      joinMatch(data.id, () => {
        if (!checkInTournament()) {
          leaveLobby()
        }

        defaultMatchOnClose()
      })
      break

    case 'tournament':
      await loadContentToTarget('menu/tournament_content.html', 'play-tournament-container')
      joinTournament(data.id)
      lobbySocket.onclose = (e) => {
        if (e.code == 1006) {
          queueNotification('magenta', 'Tournament is no longer available.', () => {})
        } else if (e.code == 4001) {
          queueNotification('magenta', 'Tournament has been closed by host.', () => {})
        }
      }

      divSwitcher.setCurrentDiv('play-lobby-container', 'play-tournament-container')
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

export function leaveLobby() {
  const isTournament = (lobbyType == 'tournament')
  inLobby = false
  lobbyType = ''
  lobbyUsers = []
  lobbyStarting = false

  // this is to check if you're leaving a lobby normally
  if (document.getElementById('lobby-list') != null) {
    initLobbyList(isTournament)
    divSwitcher.setCurrentDiv('play-lobby-container', 'play-lobby-list-container')
  } else {
    divSwitcher.setCurrentDiv('play-lobby-container', 'play-select-container')
  }

  if (lobbySocket != null) {
    lobbySocket.close()
    lobbySocket = null
  }
}

export function initClassicLobby() {
  // init self
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
    setClassicPlayerInfo(lobbyUsers[0], 'p1')
  } else {
    setClassicPlayerInfo(null, 'p1')
  }

  if (lobbyUsers.length > 1) {
    setClassicPlayerInfo(lobbyUsers[1], 'p2')
  } else {
    setClassicPlayerInfo(null, 'p2')
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
  } else if (lobbyUsers.length > 1) {
    startButton.removeAttribute('disabled')
  }
}

function setClassicPlayerInfo(info, prefix) {
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

  avatar.src = validateAvatarImg(info.avatar_img)
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

export function initTournamentLobby() {
  // init self
  document.getElementById('lobbyback').onclick = () => leaveLobby()

  const readyButton = (e) => {
    const value = (e.target.textContent != 'Unready')
    lobbySocket.send(JSON.stringify({
      'action': 'ready',
      'value': value,
    }))
  }

  document.getElementById('start-game').onclick = () => lobbySocket.send('{"action": "start"}')

  inLobby = true
  lobbyType = 'tournament'
}

export function updateTournamentLobby() {
  const path = window.location.pathname;
  if (!path.startsWith('/menu/play')) {
    return
  }

  const startButton = document.getElementById('start-game')
  // startButton.disabled = (lobbyUsers.length <= 1)
  startButton.style.setProperty(
    'visibility',
    (lobbyUsers.length > 0 && lobbyUsers[0].id == currentUserInfo.id)? 'visible' : 'hidden'
  )

  for (const user of lobbyUsers) {
    const existingEntry = document.getElementById(`tournament-user-${user.id}`)
    if (!existingEntry && 'username' in user) {
      appendTournamentUser(user)
    } else if (existingEntry && (user == null || !('username' in user))) {
      removeTournamentUser(existingEntry)
    } else {
      const ready = existingEntry.querySelector('i')
      ready.style.setProperty('visibility', (user.ready)? 'visible' : 'hidden')
    }
  }
}

function appendTournamentUser(info) {
  const avatar = document.createElement('img')
  avatar.classList.add('profile-settings-avatar')
  avatar.src = validateAvatarImg(info.avatar_img)

  const name = document.createElement('p')
  name.textContent = info.username

  const ready = document.createElement('i')
  ready.classList.add('material-icons')
  ready.style.setProperty('visibility', (info.ready)? 'visible' : 'hidden')
  ready.textContent = 'done'

  const div = document.createElement('div')
  div.id = `tournament-user-${info.id}`
  div.classList.add('lobby-entry-container')
  div.appendChild(avatar)
  div.appendChild(name)
  div.appendChild(ready)

  const list = document.getElementById('player-list')
  list.appendChild(div)
}

function removeTournamentUser(info) {
  const entry = document.getElementById(`tournament-user-${info.id}`)
  const list = document.getElementById('player-list')
  list.removeChild(entry)
}
