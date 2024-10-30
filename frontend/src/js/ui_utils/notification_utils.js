import { getColor } from "./color_utils.js"
import { addEventListenerTo } from "./ui_utils.js"

export function sendNotification(color, text, callback) {
  const notificationContainer = document.getElementById('notification-container')

  notificationContainer.style.pointerEvents = 'auto'

  notificationContainer.style.opacity = '100%'
  notificationContainer.style.backgroundColor = getColor(color, 500)
  notificationContainer.style.color = getColor(color, 200)

  notificationContainer.style.width = '20rem';
  notificationContainer.innerHTML = text

  addEventListenerTo(
    notificationContainer,
    'mouseover',
    () => {
      notificationContainer.style.backgroundColor = getColor(color, 700)
      notificationContainer.style.color = getColor(color, 400)
    }
  )

  addEventListenerTo(
    notificationContainer,
    'mouseout',
    () => {
      notificationContainer.style.backgroundColor = getColor(color, 500)
      notificationContainer.style.color = getColor(color, 200)
    }
  )

  addEventListenerTo(
    notificationContainer,
    'mousedown',
    () => {
      notificationContainer.style.backgroundColor = getColor(color, 800)
      notificationContainer.style.color = getColor(color, 600)
    }
  )

  addEventListenerTo(
    notificationContainer,
    'mouseup',
    async () => callback()
  )

  setTimeout(() => {
    notificationContainer.style.opacity = '0%'
    notificationContainer.style.pointerEvents = 'auto'
  }, 2000)
}
