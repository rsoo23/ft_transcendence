
import { addEventListenerTo, loadContentToTarget } from "./ui_utils/ui_utils.js"
import { getColor } from "./ui_utils/color_utils.js"

export function initAddFriendButton() {
  const button = document.getElementById('add-friend-button')
  const icon = document.getElementById('add-friend-icon')
  const colorName = 'blue'

  addEventListenerTo(
    button,
    'click',
    async () => {
      await loadContentToTarget('menu/friend_search_panel.html', 'friends-container')
      initCloseSearchFriendButton()
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

export function initCloseSearchFriendButton() {
  const button = document.getElementById('close-search-friend-button')
  const icon = document.getElementById('close-search-friend-icon')
  const colorName = 'blue'

  addEventListenerTo(
    button,
    'click',
    async () => {
      await loadContentToTarget('menu/friend_list_panel.html', 'friends-container')
      initAddFriendButton()
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
