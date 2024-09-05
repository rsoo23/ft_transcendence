
import { addEventListenerTo } from "./ui_utils.js";
import { getColor, getRandomColor } from "./color_utils.js";
import { hideTooltip, showTooltip } from "./tooltip_utils.js";
import { loadContentToMainMenu } from "../router.js";
// import { loadMainMenuContent } from "../main_menu_panel.js";

let hotbarItems

export function initHotbar() {
  hotbarItems = {
    'play': {
      'name': 'play',
      'urlPath': '/menu/play',
      'button': document.getElementById('play-button'),
      'icon': document.getElementById('play-icon'),
      'tooltip': document.getElementById('play-tooltip'),
      'isSelected': true,
      'color': 'teal'
    },
    'stats': {
      'name': 'stats',
      'urlPath': '/menu/stats',
      'button': document.getElementById('stats-button'),
      'icon': document.getElementById('stats-icon'),
      'tooltip': document.getElementById('stats-tooltip'),
      'isSelected': false,
      'color': 'yellow'
    },
    'friends': {
      'name': 'friends',
      'urlPath': '/menu/friends',
      'button': document.getElementById('friends-button'),
      'icon': document.getElementById('friends-icon'),
      'tooltip': document.getElementById('friends-tooltip'),
      'isSelected': false,
      'color': 'blue'
    },
    'how-to-play': {
      'name': 'how-to-play',
      'urlPath': '/menu/how_to_play',
      'button': document.getElementById('how-to-play-button'),
      'icon': document.getElementById('how-to-play-icon'),
      'tooltip': document.getElementById('how-to-play-tooltip'),
      'isSelected': false,
      'color': 'orange'
    },
    'settings': {
      'name': 'settings',
      'urlPath': '/menu/settings',
      'button': document.getElementById('settings-button'),
      'icon': document.getElementById('settings-icon'),
      'tooltip': document.getElementById('settings-tooltip'),
      'isSelected': false,
      'color': 'magenta'
    }
  }

  initButton(hotbarItems['play'])
  initButton(hotbarItems['stats'])
  initButton(hotbarItems['friends'])
  initButton(hotbarItems['how-to-play'])
  initButton(hotbarItems['settings'])
}

// sets the selected button's isSelected variable to true and the rest is false
// also sets resets all the colors of the non-selected buttons
function updateButtonState(buttonName) {
  hotbarItems[buttonName]['isSelected'] = true

  Object.keys(hotbarItems).forEach(key => {
    if (key !== buttonName) {
      const buttonColor = hotbarItems[key]['color']

      hotbarItems[key]['isSelected'] = false
      hotbarItems[key]['button'].style.backgroundColor = '#000'
      hotbarItems[key]['icon'].style.color = getColor(buttonColor, 500)

      return
    }
  });
}

function updateBorderColor(buttonColor) {
  const mainMenuPanel = document.getElementById('main-menu-panel')
  const hotbar = document.getElementById('hotbar')

  if (!mainMenuPanel) {
    console.error("Error in updateBorderColor(): main-menu-panel not found")
    return
  }
  if (!hotbar) {
    console.error("Error in updateBorderColor(): hotbar not found")
    return
  }

  mainMenuPanel.style.border = `5px solid var(--${buttonColor}-500)`
  hotbar.style.border = `5px solid var(--${buttonColor}-500)`
}

function initButton(hotbarItemInfo) {
  const buttonName = hotbarItemInfo['name']
  const button = hotbarItemInfo['button']
  const icon = hotbarItemInfo['icon']
  const tooltip = hotbarItemInfo['tooltip']
  const buttonColor = hotbarItemInfo['color']
  const urlPath = hotbarItemInfo['urlPath']

  addEventListenerTo(
    button,
    'mouseover',
    () => {
      showTooltip(tooltip)
      if (!hotbarItemInfo['isSelected']) {
        button.style.backgroundColor = getColor(buttonColor, 700)
        icon.style.color = getColor(buttonColor, 400)
      }
    }
  )

  addEventListenerTo(
    button,
    'mouseout',
    () => {
      hideTooltip(tooltip)
      if (!hotbarItemInfo['isSelected']) {
        button.style.backgroundColor = '#000'
        icon.style.color = getColor(buttonColor, 500)
      } else {
        button.style.backgroundColor = getColor(buttonColor, 500)
        icon.style.color = getColor(buttonColor, 200)
      }
    }
  )

  addEventListenerTo(
    button,
    'mousedown',
    () => {
      if (!hotbarItemInfo['isSelected']) {
        button.style.backgroundColor = getColor(buttonColor, 800)
        icon.style.color = getColor(buttonColor, 600)
      }
    }
  )

  addEventListenerTo(
    button,
    'mouseup',
    async () => {
      if (!hotbarItemInfo['isSelected']) {
        updateButtonState(buttonName)
        updateBorderColor(buttonColor)

        window.history.pushState({}, '', `${urlPath}`)
        await loadContentToMainMenu()

        button.style.backgroundColor = getColor(buttonColor, 500)
        icon.style.color = getColor(buttonColor, 200)
      } else {
        button.style.backgroundColor = getColor(buttonColor, 500)
        icon.style.color = getColor(buttonColor, 200)
      }
    }
  )
}
