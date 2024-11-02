import { getColor } from "./color_utils.js"
import { addEventListenerTo } from "./ui_utils.js"

const NOTIFICATION_DURATION = 2000
let notificationQueue = []

export function queueNotification(color, text, callback) {
  notificationQueue.push({ color, text, callback })
  processNotificationQueue()
}

// the shift method uses FIFO, pushing out the first notification from notificationQueue
function processNotificationQueue() {
  if (notificationQueue.length === 0) return;

  const notificationContainer = document.getElementById('notification-container')
  const { color, text, callback } = notificationQueue.shift();
  const notification = createNotification(color, text, () => callback);

  notificationContainer.appendChild(notification)
  setTimeout(() => {
    notification.style.opacity = '0%'
    notification.style.pointerEvents = 'auto'

    setTimeout(() => {
      notificationContainer.firstChild.remove()
    }, 200)

  }, NOTIFICATION_DURATION)
}

export function createNotification(color, text, callback) {
  const notification = document.createElement('div')

  notification.classList.add('notification')

  notification.style.pointerEvents = 'auto'

  notification.style.opacity = '100%'
  notification.style.backgroundColor = getColor(color, 500)
  notification.style.color = getColor(color, 200)

  notification.style.width = '20rem';
  notification.innerHTML = text

  addEventListenerTo(
    notification,
    'mous',
    () => {
      notification.style.backgroundColor = getColor(color, 700)
      notification.style.color = getColor(color, 400)
    }
  )

  addEventListenerTo(
    notification,
    'mouseout',
    () => {
      notification.style.backgroundColor = getColor(color, 500)
      notification.style.color = getColor(color, 200)
    }
  )

  addEventListenerTo(
    notification,
    'mousedown',
    () => {
      notification.style.backgroundColor = getColor(color, 800)
      notification.style.color = getColor(color, 600)
    }
  )

  addEventListenerTo(
    notification,
    'mouseup',
    async () => callback()
  )

  return notification
}
