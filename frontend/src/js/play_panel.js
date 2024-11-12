import { initRandomColorButton } from "./ui_utils/button_utils.js"
import { createMatch, joinMatch } from "./game/api.js";
import { loadPage } from "./router.js";
import { loadContentToTarget } from "./ui_utils/ui_utils.js";
import { getRequest } from "./network_utils/api_requests.js";

// FILO array
var panelBacklog = Array()
var divBacklog = Array()

export function initPanelBacklog(listOfPanels, listOfDivs, current) {
  panelBacklog = listOfPanels
  divBacklog = listOfDivs
}

function setCurrentElement(element, pastCurrentElement, oldCurrentElement, currentElement) {
  // skip transition if not in view
  if (element == oldCurrentElement || element == currentElement) {
    element.style.transition = ''
  } else {
    element.style.transition = '0'
  }

  let buttons = element.querySelectorAll('button')
  if (element != currentElement && !pastCurrentElement) {
    element.style.setProperty('left', '-100rem')
    element.style.setProperty('opacity', '0')
    element.style.setProperty('visibility', 'hidden', 'important')
    element.style.setProperty('pointer-events', 'none', 'important')
    buttons.forEach((b) => b.disabled = true)
  } else if (element == currentElement) {
    element.style.setProperty('left', '0')
    element.style.setProperty('opacity', '1')
    element.style.setProperty('visibility', 'visible', 'important')
    element.style.setProperty('pointer-events', 'auto', 'important')
    buttons.forEach((b) => b.disabled = false)
  } else {
    element.style.setProperty('left', '100rem')
    element.style.setProperty('opacity', '0')
    element.style.setProperty('visibility', 'hidden', 'important')
    element.style.setProperty('pointer-events', 'none', 'important')
    buttons.forEach((b) => b.disabled = true)
  }
}

export function setCurrentPanel(oldCurrentPanel, currentPanel) {
  let backlog = panelBacklog

  let pastCurrentPanel = false
  for (const panel of backlog) {
    setCurrentElement(panel, pastCurrentPanel, oldCurrentPanel, currentPanel)
    if (panel == currentPanel) {
      pastCurrentPanel = true
    }
  }
}

export function setCurrentDiv(oldCurrentDiv, currentDiv) {
  let backlog = divBacklog

  let pastCurrentDiv = false
  for (const div of backlog) {
    setCurrentElement(div, pastCurrentDiv, oldCurrentDiv, currentDiv)
    if (div == currentDiv) {
      pastCurrentDiv = true
    }
  }
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
