import { initRandomColorButton } from "./ui_utils/button_utils.js"
import { createMatch, joinMatch } from "./game/api.js";
import { loadPage } from "./router.js";
import { loadContentToTarget } from "./ui_utils/ui_utils.js";

// FILO array
var panelBacklog = Array()
var localPlay = false

export function clearPanelBacklog() {
  panelBacklog = Array()
}

export function setLocalPlayMode(bool) {
  localPlay = bool
}

export function getLocalPlayMode() {
  return localPlay
}

export function goToNextPanel(current, next) {
  panelBacklog.push(current)
  current.style.left = '-100rem'
  current.style.opacity = '0'
  current.style.visibility = 'hidden'
  next.style.left = '0'
  next.style.opacity = '1'
  next.style.visibility = 'visible'
}

export function goToPreviousPanel(current) {
  const previous = panelBacklog.pop()
  previous.style.left = '0'
  previous.style.opacity = '1'
  previous.style.visibility = 'visible'
  current.style.left = '100rem'
  current.style.opacity = '0'
  current.style.visibility = 'hidden'
}

export async function loadMultiplayerTest() {
  await loadContentToTarget('menu/multiplayer_test.html', 'play-settings-container')
  document.getElementById('testback').onclick = () => goToPreviousPanel(document.getElementById('play-settings-container'))
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
