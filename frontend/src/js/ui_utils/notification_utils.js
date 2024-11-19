import { getColor } from "./color_utils.js"
import { addEventListenerTo, truncateString } from "./ui_utils.js"
import { goToLobby } from "../lobby_list.js"
import { leaveLobby } from "../lobby.js"
import { loadMainMenuContent } from "../router.js"

const NOTIFICATION_DURATION = 20000
let notificationQueue = []

export function queueNotification(color, text, callback) {
  notificationQueue.push({ color, text, callback })
  processNotificationQueue()
}

// the shift method uses FIFO, pushing out the first notification from notificationQueue
function processNotificationQueue() {
  if (notificationQueue.length === 0) return;

  const notificationContainer = document.getElementById('notification-container')
  if (!notificationContainer) return;
  const { color, text, callback } = notificationQueue.shift();
  const notification = createNotification(color, text, () => callback);

  notificationContainer.appendChild(notification)
  setTimeout(() => deleteNotification(notification), NOTIFICATION_DURATION)
}

function deleteNotification(notification) {
  notification.style.opacity = '0%'
  notification.style.pointerEvents = 'auto'

  setTimeout(() => {
    notification.remove()
  }, 200)
}

export function createGameInviteNotification(username, lobbyID, isTournament) {
  const type = (isTournament)? 'Tournament' : 'Classic'
  const notificationContainer = document.getElementById('notification-container')
  const notification = createNotification('blue', `${truncateString(username, 15)} has invited you to their ${type} lobby.`, () => {})

  const accept = document.createElement('button')
  accept.textContent = 'check'
  accept.classList.add('material-icons')
  accept.classList.add('button')
  accept.classList.add('round-button')
  accept.style.setProperty('background-color', 'transparent')
  accept.onclick = async () => {
    deleteNotification(notification)
    leaveLobby()
    await loadMainMenuContent('play')
    await goToLobby(lobbyID, isTournament)
  }

  const decline = document.createElement('button')
  decline.textContent = 'close'
  decline.classList.add('material-icons')
  decline.classList.add('button')
  decline.classList.add('round-button')
  decline.style.setProperty('background-color', 'transparent')
  decline.onclick = () => deleteNotification(notification)

  notification.appendChild(accept)
  notification.appendChild(decline)
  notification.style.setProperty('width', 'fit-content')
  notificationContainer.appendChild(notification)

  setTimeout(() => deleteNotification(notification), NOTIFICATION_DURATION)
}

export function createNotification(color, text, callback) {
  const notification = document.createElement('div')

  notification.classList.add('notification')
  notification.classList.add('no-scrollbar')

  notification.style.pointerEvents = 'auto'
  notification.style.opacity = '100%'
  notification.style.backgroundColor = getColor(color, 500)
  notification.style.color = getColor(color, 200)
  notification.style.width = '20rem';
  notification.style.padding = '0 1rem'
  notification.style.overflowX = 'scroll'

  if (text.length < 40) {
    notification.style.display = 'flex'
    notification.style.justifyContent = 'center'
  }

  notification.innerHTML = text

  addEventListenerTo(
    notification,
    'mousedown',
    async () => callback()
  )

  return notification
}
