import { getAccessToken } from "./network_utils/token_utils.js";
import { currentUserInfo } from "./global_vars.js";
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
      // initTournamentList(data.info.brackets, data.info.pairs)
      initTournamentList(5, 10)
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

function initTournamentList(brackets, pairs) {
  const list = document.getElementById('bracket-list')
  for (let b = 0; b < brackets; b++) {
    const bracketContainer = document.createElement('div')
    bracketContainer.classList.add('tournament-bracket-container')

    for (let p = 0; p < pairs; p++) {
      const createPair = () => {
        const avatar = document.createElement('img')
        avatar.classList.add('profile-settings-avatar')
        const name = document.createElement('p')

        const div = document.createElement('div')
        div.classList.add('tournament-user-container')
        div.appendChild(avatar)
        div.appendChild(name)
        return div
      }

      const pair = document.createElement('div')
      pair.classList.add('tournament-pair-container')
      pair.appendChild(createPair())
      pair.appendChild(createPair())

      bracketContainer.appendChild(pair)
    }

    list.appendChild(bracketContainer)
    pairs = Math.ceil(pairs / 2)
  }
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
