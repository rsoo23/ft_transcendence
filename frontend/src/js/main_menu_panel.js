
import { loadComponent } from "./utils/ui_utils.js";
import { addEventListenerTo } from "./utils/ui_utils.js";
import { getColor, getRandomColor } from "./utils/color_utils.js";
import { hideTooltip, showTooltip } from "./utils/tooltip_utils.js";

let hotbarItems

document.addEventListener("DOMContentLoaded", () => {
  loadMainMenuPanel()
})

export async function loadMainMenuPanel() {
  try {
    await loadComponent('components/menu/main_menu_panel.html')

    initHotbar()
  } catch (error) {
    console.error('Error loading Main Menu Panel :', error)
  }
}

function initHotbar() {
  hotbarItems = {
    'play': {
      'name': 'play',
      'button': document.getElementById('play-button'),
      'icon': document.getElementById('play-icon'),
      'tooltip': document.getElementById('play-tooltip'),
      'isSelected': true,
      'color': 'teal'
    },
    'stats': {
      'name': 'stats',
      'button': document.getElementById('stats-button'),
      'icon': document.getElementById('stats-icon'),
      'tooltip': document.getElementById('stats-tooltip'),
      'isSelected': false,
      'color': 'yellow'
    },
    'friends': {
      'name': 'friends',
      'button': document.getElementById('friends-button'),
      'icon': document.getElementById('friends-icon'),
      'tooltip': document.getElementById('friends-tooltip'),
      'isSelected': false,
      'color': 'blue'
    },
    'how-to-play': {
      'name': 'how-to-play',
      'button': document.getElementById('how-to-play-button'),
      'icon': document.getElementById('how-to-play-icon'),
      'tooltip': document.getElementById('how-to-play-tooltip'),
      'isSelected': false,
      'color': 'orange'
    },
    'settings': {
      'name': 'settings',
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

      console.log('hotbarItem: ', hotbarItems[key])
      return
    }
  });
}

function initButton(hotbarItemInfo) {
  const buttonName = hotbarItemInfo['name']
  const button = hotbarItemInfo['button']
  const icon = hotbarItemInfo['icon']
  const tooltip = hotbarItemInfo['tooltip']
  const buttonColor = hotbarItemInfo['color']

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
        updateButtonState(buttonName)
        button.style.backgroundColor = getColor(buttonColor, 800)
        icon.style.color = getColor(buttonColor, 600)
      }
    }
  )

  addEventListenerTo(
    button,
    'mouseup',
    () => {
      if (!hotbarItemInfo['isSelected']) {
        button.style.backgroundColor = '#000'
        icon.style.color = getColor(buttonColor, 500)
      } else {
        button.style.backgroundColor = getColor(buttonColor, 500)
        icon.style.color = getColor(buttonColor, 200)
      }
    }
  )
}
