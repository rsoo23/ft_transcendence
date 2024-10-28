import { postRequest } from '../network_utils/api_requests.js'
import { initRenderer, stopRenderer, updateRenderer } from './worker_ui_handler.js'
import { loadPage, loadMainMenuContent } from '../router.js'
import { PONG_INPUTS } from '../global_vars.js'

var matchSocket = null
var localPlay = false

export function setLocalPlayMode(bool) {
  localPlay = bool
}

export async function createMatch(player1ID, player2ID) {
  const response = await postRequest('/api/pong/create-match/', {
    'player1_uuid': player1ID,
    'player2_uuid': player2ID,
  })
  if (!response['success']) {
    return null
  }

  return response['match_id']
}

// TODO: delete userid
export async function joinMatch(matchID, userID) {
  if (matchSocket != undefined)
  	matchSocket.close()

  initRenderer()
  matchSocket = new WebSocket(`ws://localhost:8000/ws/pong/${matchID}?user=${userID}`)
  matchSocket.onmessage = (e) => {
    const gameData = JSON.parse(e.data)
    updateRenderer(gameData)
  }

  matchSocket.onclose = async (e) => {
    console.log('connection closed')
    stopRenderer()
    window.onkeydown = null
    window.onkeyup = null

    // TODO: go to match end or something
    await loadPage('main_menu')
    loadMainMenuContent('play')
  }

  window.onkeydown = (e) => {
    if (e.repeat || !(e.keyCode in PONG_INPUTS))
      return;

    matchSocket.send(JSON.stringify({
      'type': 'input',
      'input': `${PONG_INPUTS[e.keyCode]}`,
      'value': true,
    }))
  }

  window.onkeyup = (e) => {
    if (e.repeat || !(e.keyCode in PONG_INPUTS))
      return;

    matchSocket.send(JSON.stringify({
      'type': 'input',
      'input': `${PONG_INPUTS[e.keyCode]}`,
      'value': false,
    }))
  }
}
