import { initRandomColorButton } from "./ui_utils/button_utils.js"
import { createMatch, joinMatch } from "./game/api.js";
import { loadPage } from "./router.js";
import { loadContentToTarget } from "./ui_utils/ui_utils.js";
import { getRequest } from "./network_utils/api_requests.js";
import { PanelSwitcher } from "./ui_utils/panelswitcher_utils.js";

// for moving stuff
export var startingMenuSwitcher = null
export var divSwitcher = null

export function initPlayDivs() {
  const playTypeButtons = document.getElementById('playtype')
  const gamemodeButtons = document.getElementById('gamemode')
  const gameSelectDiv = document.getElementById('play-select-container')
  const gameLobbyListDiv = document.getElementById('play-lobby-list-container')
  const gameSettingsDiv = document.getElementById('play-settings-container')
  const gameLobbyDiv = document.getElementById('play-lobby-container')
  const gameTournamentDiv = document.getElementById('play-tournament-container')

  startingMenuSwitcher = new PanelSwitcher(playTypeButtons, [playTypeButtons, gamemodeButtons])
  divSwitcher = new PanelSwitcher(gameSelectDiv, [gameSelectDiv, gameLobbyListDiv, gameSettingsDiv, gameLobbyDiv, gameTournamentDiv])
}

export async function loadMultiplayerTest() {
  await loadContentToTarget('menu/multiplayer_test.html', 'play-settings-container')
  document.getElementById('testback').onclick = () => setCurrentDiv(document.getElementById('play-settings-container'), document.getElementById('play-select-container'))
  initRandomColorButton(
    'testmatch',
    'play-container',
    async () => {
      const player1_uuid = document.getElementById('player1').value
      const player2_uuid = document.getElementById('player2').value
      const matchID = await createMatch(player1_uuid, player2_uuid)
      if (matchID != null) {
        document.getElementById('matchid').value = matchID
      }
    }
  )
  initRandomColorButton(
    'websocket',
    'play-container',
    async () => {
      const matchID = document.getElementById('matchid').value
      const userID = document.getElementById('user').value
      await loadPage('game')
      joinMatch(matchID, userID)
    }
  )
}

export async function startLocalGame() {
  let matchID = null
  try {
    const user = await getRequest('/api/users/current_user/')
    matchID = await createMatch(user['id'], 0, 'local_classic')
  } catch (error) {
    console.error('Encountered error: ', error)
  }

  if (matchID == null) {
    return
  }
  await loadPage('game')
  joinMatch(matchID, 0)
}
