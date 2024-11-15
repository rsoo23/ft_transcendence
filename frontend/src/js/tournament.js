import { getAccessToken } from "./network_utils/token_utils.js";
import { currentUserInfo, usersInfo } from "./global_vars.js";
import { getRequest } from "./network_utils/api_requests.js";
import { validateAvatarImg, leaveLobby } from "./lobby.js";
import { queueNotification } from "./ui_utils/notification_utils.js";

var tournamentSocket = null
var tournamentInfo = {}
var tournamentBrackets = {}
var tournamentCurrentOpponent = null
var tournamentWinner = null
var inTournament = false

export function checkInTournament() {
  return inTournament
}

export function checkIsTournamentOpponent(id) {
  return (tournamentCurrentOpponent && id == tournamentCurrentOpponent.id)
}

export async function joinTournament(id) {
  inTournament = true
  tournamentSocket = new WebSocket(`ws://${window.location.host}/ws/tournament/${id}`, ['Authorization', getAccessToken()])
  tournamentSocket.onmessage = async (e) => {
    const data = JSON.parse(e.data)
    console.log(data)

    switch (data.event) {
    case 'ready':
      break

    case 'info':
      console.log(data.info.list)
      tournamentInfo = data.info.list
      if (document.getElementById('bracket-list') == null) {
        break
      }

      loadTournamentList()
      break

    case 'list':
      tournamentBrackets[data.bracket] = data.pairs
      tournamentCurrentOpponent = data.opponent
      for (let i = 0; i < data.pairs.length; i++) {
        let newPair = []
        for (const id of data.pairs[i]) {
          if (!id) {
            newPair.push(null)
            continue
          }

          const response = await getRequest(`/api/users/${id}/`)
          newPair.push(response)
        }

        tournamentBrackets[data.bracket][i] = newPair
      }

      updateTournamentList()
      break

    // maybe this is handled by lobby?
    case 'left':
      if (checkIsTournamentOpponent(data.user)) {
        break
      }
      break

    case 'winner':
      const response = await getRequest(`/api/users/${data.user}/`)
      tournamentWinner = response

      if (document.getElementById('bracket-list') == null) {
        break
      }

      loadTournamentList()
      break
    }
  }

  tournamentSocket.onclose = (e) => {
    tournamentSocket = null

    if (e.code == 1006) {
      queueNotification('magenta', 'Tournament is no longer available.', () => {})
    } else if (e.code == 1011) {
      queueNotification('magenta', 'Invalid tournament.', () => {})
    }

    if (inTournament) {
      leaveTournament()
    }
  }

  tournamentSocket.onopen = () => {}
}

export function leaveTournament() {
  tournamentInfo = {}
  tournamentCurrentOpponent = null
  inTournament = false

  if (tournamentSocket != null) {
    tournamentSocket.close()
  }

  // just let the lobby system handle the transition :]
  leaveLobby()
}

function initTournamentReadyButtons() {
  const button = document.getElementById('p1-ready')

  button.onclick = (e) => {
    const target = e.currentTarget
    const isReady = (target.textContent == 'Unready')
    if (isReady) {
      target.textContent = 'Ready'
    } else {
      target.textContent = 'Unready'
    }
    tournamentSocket.send(JSON.stringify({
      'action': 'ready',
      'value': !isReady,
    }))
  }
}

export function loadTournamentList() {
  const createPair = (id) => {
    const avatar = document.createElement('img')
    avatar.classList.add('profile-settings-avatar')
    const name = document.createElement('p')
    name.textContent = id

    const div = document.createElement('div')
    div.classList.add('tournament-user-container')
    div.appendChild(avatar)
    div.appendChild(name)
    return div
  }
  console.log(usersInfo)
  const getUser = (id) => {
    if (currentUserInfo.id == id) {
      return currentUserInfo
    }

    for (const user of usersInfo) {
      if (user['id'] != id) {
        continue
      }
      return user
    }
    return null
  }

  const list = document.getElementById('bracket-list')
  list.innerHTML = ''
  for (const round of tournamentInfo) {
    const bracketContainer = document.createElement('div')
    bracketContainer.classList.add('tournament-bracket-container')

    for (const pairInfo of round) {
      const pair = document.createElement('div')
      pair.classList.add('tournament-pair-container')

      let p1Div
      let p2Div
      if (pairInfo.player1) {
        const player1 = getUser(pairInfo.player1.id)
        p1Div = createPair(player1.username)
      } else {
        p1Div = createPair('')
      }

      if (pairInfo.player2) {
        const player2 = getUser(pairInfo.player2.id)
        p2Div = createPair(player2.username)
      } else {
        p2Div = createPair('')
      }

      pair.appendChild(p1Div)
      pair.appendChild(p2Div)
      bracketContainer.appendChild(pair)
    }

    list.appendChild(bracketContainer)
  }

  const winnerContainer = document.createElement('div')
  winnerContainer.classList.add('tournament-bracket-container')
  const winner = document.createElement('div')
  winner.classList.add('tournament-pair-container')
  let winnerDiv
  if (tournamentWinner) {
    const winnerUser = getUser(tournamentWinner.id)
    winnerDiv = createPair(winnerUser.username)
  } else {
    winnerDiv = createPair('')
  }
  winnerContainer.appendChild(winnerDiv)
  list.appendChild(winnerContainer)

  initTournamentReadyButtons()
}

function updateTournamentList() {
  const list = document.getElementById('bracket-list')
  for (const [num, bracket] of Object.entries(tournamentBrackets)) {
    for (const pair of bracket) {
      for (const user of pair) {
        if (!user) {
          continue
        }

        const avatar = document.createElement('img')
        avatar.classList.add('profile-settings-avatar')
        avatar.src = validateAvatarImg(user.avatar_img)
        const name = document.createElement('p')
        name.textContent = user.username

        const div = document.createElement('div')
        div.classList.add('tournament-pair-container')
        div.appendChild(avatar)
        div.appendChild(name)

        list.appendChild(div)
      }
    }
  }
}
