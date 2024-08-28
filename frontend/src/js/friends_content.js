
import { addEventListenerTo } from "./utils/ui_utils.js"
import { getColor } from "./utils/color_utils.js"


export function initAddFriendButton() {
  const button = document.getElementById('add-friend-button')
  const icon = document.getElementById('add-friend-icon')
  const colorName = 'blue'

  addEventListenerTo(
    button,
    'click',
    () => {
      loadToFriendsContainer('friend_search_panel.html')
    }
  )

  addEventListenerTo(
    button,
    'mouseover',
    () => {
      button.style.backgroundColor = getColor(colorName, 700)
      icon.style.color = getColor(colorName, 400)
    }
  )

  addEventListenerTo(
    button,
    'mouseout',
    () => {
      button.style.backgroundColor = getColor(colorName, 500)
      icon.style.color = getColor(colorName, 200)
    }
  )

  addEventListenerTo(
    button,
    'mousedown',
    () => {
      button.style.backgroundColor = getColor(colorName, 800)
      icon.style.color = getColor(colorName, 500)
    }
  )

  addEventListenerTo(
    button,
    'mouseup',
    () => {
      button.style.backgroundColor = getColor(colorName, 700)
      icon.style.color = getColor(colorName, 400)
    }
  )
}

export async function loadToFriendsContainer(fileName) {
  try {
    const response = await fetch(`/static/components/menu/${fileName}`)
    const html = await response.text()

    document.getElementById('friends-container').innerHTML = html;
  } catch (error) {
    console.error(`Error loading static/components/menu/${fileName}:`, error)
  }
}

