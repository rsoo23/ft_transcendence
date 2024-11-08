import { getAccessToken } from "./network_utils/token_utils.js"
import { getRequest } from "./network_utils/api_requests.js"
import { loadContentToTarget } from "./ui_utils/ui_utils.js";
import {
  initClassicLobby,
  updateClassicLobby,
  createLobby,
  createTournamentLobby,
  initTournamentLobby,
  updateTournamentLobby,
  joinLobby,
} from "./lobby.js";
import { divSwitcher } from "./play_panel.js";

var lobbyListSocket = null
var lobbyListTournament = false

export async function initLobbyList(isTournament) {
  document.getElementById('lobby-list').innerHTML = ''
  lobbyListTournament = isTournament
  lobbyListSocket = new WebSocket(`ws://${window.location.host}/ws/lobby_list/`, [
    'Authorization', getAccessToken(),
    'IsTournament', `${isTournament}`,
  ])
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

export async function goToLobby(lobbyID, isTournament) {
  const content = (isTournament)? 'menu/lobby_tournament_content.html' : 'menu/lobby_classic_content.html'
  await loadContentToTarget(content, 'play-lobby-container')
  closeLobbyListSocket()
  await joinLobby(lobbyID)

  const prevDiv = document.getElementById('play-lobby-list-container')
  if (isTournament) {
    initTournamentLobby(prevDiv)
  } else {
    initClassicLobby(prevDiv)
  }
  divSwitcher.setCurrentDiv(prevDiv, document.getElementById('play-lobby-container'))
  if (isTournament) {
    updateTournamentLobby()
  } else {
    updateClassicLobby()
  }
}

async function appendLobbyEntry(lobbyId) {
  const buttonJoinLobby = async (e) => {
    const target = e.currentTarget
    const substr = target.id.substring('lobby-entry-'.length)
    const lobbyID = Number(substr)
    await goToLobby(lobbyID, lobbyListTournament)
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
