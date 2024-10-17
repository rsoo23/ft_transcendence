
import { addEventListenerTo } from "./ui_utils.js";
import { getColor, getRandomColor } from "./color_utils.js";
import { hideTooltip, showTooltip } from "./tooltip_utils.js";
import { loadContentToMainMenu } from "../router.js";
import { hotbarItems, setHotbarSelected } from "../global_vars.js";

export function initHotbar() {
  Object.keys(hotbarItems).forEach(key => {
    initButton(hotbarItems[key])
  });
}

function initButton(hotbarItemInfo) {
  const contentName = hotbarItemInfo['name']
  const buttonColor = hotbarItemInfo['color']
  const urlPath = hotbarItemInfo['urlPath']
  const button = document.getElementById(`${contentName}-button`)
  const icon = document.getElementById(`${contentName}-icon`)
  const tooltip = document.getElementById(`${contentName}-tooltip`)

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

        window.history.pushState({}, '', `${urlPath}`)
        await loadContentToMainMenu(contentName)

        button.style.backgroundColor = getColor(buttonColor, 500)
        icon.style.color = getColor(buttonColor, 200)
      } else {
        button.style.backgroundColor = getColor(buttonColor, 500)
        icon.style.color = getColor(buttonColor, 200)
      }
    }
  )
}

// sets the selected button's isSelected variable to true and the rest is false
// set the color of the selected button
// resets all the colors of the non-selected buttons
export function updateButtonState(contentName) {
  const selectedButton = document.getElementById(`${contentName}-button`)
  const selectedIcon = document.getElementById(`${contentName}-icon`)
  const color = hotbarItems[contentName]['color']

  setHotbarSelected(contentName, true)
  selectedButton.style.backgroundColor = getColor(color, 500)
  selectedIcon.style.color = getColor(color, 200)

  Object.keys(hotbarItems).forEach(key => {
    if (key !== contentName) {
      const button = document.getElementById(`${key}-button`)
      const icon = document.getElementById(`${key}-icon`)
      const buttonColor = hotbarItems[key]['color']

      setHotbarSelected(key, false)
      button.style.backgroundColor = '#000'
      icon.style.color = getColor(buttonColor, 500)

      return
    }
  });
}

export function updateBorderColor(contentName) {
  const mainMenuPanel = document.getElementById('main-menu-panel')
  const hotbar = document.getElementById('hotbar')
  const buttonColor = hotbarItems[contentName]['color']

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

