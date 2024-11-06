import { postRequest } from '../network_utils/api_requests.js'
import { getAccessToken } from '../network_utils/token_utils.js'
import { initRenderer, stopRenderer, updateRenderer } from './worker_ui_handler.js'
import { loadPage, loadMainMenuContent } from '../router.js'
import { PONG_INPUTS } from '../global_vars.js'
import { leaveLobby } from '../lobby.js'

var matchSocket = null
var inMatchID = 0

export async function createMatch(player1ID, player2ID, local) {
  const response = await postRequest('/api/pong/create-match/', {
    'player1_uuid': player1ID,
    'player2_uuid': player2ID,
    'local': local,
  })
  if (!response['success']) {
    console.log(response['Error'])
    return null
  }

  return response['match_id']
}

var prevMessageRecv = 0
var socketChecker = null

// TODO: delete userid
export async function joinMatch(matchID, userID) {
  if (matchSocket != undefined) {
  	matchSocket.close()
  }

  initRenderer()
  await createSocket(matchID)
}

// TODO: maybe adjust this to handle bad latency too?
async function checkSocket() {
  if (performance.now() - prevMessageRecv < 200) {
    socketChecker = setTimeout(checkSocket, 100)
    return
  }

  socketChecker = null
  if (matchSocket == undefined || matchSocket.readyState >= 2) {
    return
  }

  console.log('connection might be stuck, reconnecting')
  matchSocket.onclose = () => {}
  matchSocket.close()
  await createSocket(inMatchID)
}

async function createSocket(matchID) {
  inMatchID = matchID
  matchSocket = new WebSocket(
    `ws://${window.location.host}/ws/pong/${matchID}`,
    ['Authorization', getAccessToken()]
  )
  matchSocket.onmessage = (e) => {
    prevMessageRecv = performance.now()
    const gameData = JSON.parse(e.data)
    updateRenderer(gameData)
  }

  matchSocket.onclose = async (e) => {
    try {
      clearTimeout(socketChecker)
    } catch (e) {
      console.log(e)
    }
    console.log(`connection closed, reason: ${e.code}: ${e.reason}`)
    stopRenderer()
    window.onkeydown = null
    window.onkeyup = null
    matchSocket = null

    // TODO: go to match end or something
    leaveLobby()
    await loadPage('main_menu')
    loadMainMenuContent('play')
  }

  matchSocket.onopen = () => {
    prevMessageRecv = performance.now()
    socketChecker = setTimeout(checkSocket, 1000)
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
