import { getAccessToken } from "./network_utils/token_utils.js";
import { currentUserInfo, usersInfo } from "./global_vars.js";
import { getRequest } from "./network_utils/api_requests.js";
import { validateAvatarImg } from "./lobby.js";

var tournamentSocket = null
var tournamentInfo = {}
var tournamentBrackets = {}
var tournamentCurrentOpponent = null
var inTournament = false

export function checkInTournament() {
  return inTournament
}

export function checkIsTournamentOpponent(id) {
  return (id == tournamentCurrentOpponent.id)
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
      initTournamentList(data.info.list)
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

    case 'opponent':
      break

    case 'win':
      break

    case 'status':
      break
    }
  }

  tournamentSocket.onclose = () => {}

  tournamentSocket.onopen = () => {}
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

function initTournamentList(clist) {
  const list = document.getElementById('bracket-list')
  for (const round of clist) {
    const bracketContainer = document.createElement('div')
    bracketContainer.classList.add('tournament-bracket-container')

    for (const pairInfo of round) {
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

      const pair = document.createElement('div')
      pair.classList.add('tournament-pair-container')
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
      const player1 = getUser(pairInfo.player1.id)
      const player2 = getUser(pairInfo.player2.id)
      if (player1)
        pair.appendChild(createPair(player1.username))
      if (player2)
        pair.appendChild(createPair(player2.username))

      bracketContainer.appendChild(pair)
    }

    list.appendChild(bracketContainer)
  }

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
