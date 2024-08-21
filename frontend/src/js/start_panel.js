
import { loadLoginPanel } from "./login_panel.js";
import { loadSignupPanel } from "./signup_panel.js";
import { getColor, getRandomColor } from "./utils/color_utils.js";
import { loadComponent } from "./utils/ui_utils.js";
import { addEventListenerTo } from "./utils/ui_utils.js";
import { initPanelShrinkAnim } from "./animations/ui_anim_utils.js";

document.addEventListener("DOMContentLoaded", () => {
  loadStartPanel()
})

export async function loadStartPanel() {
  try {
    await loadComponent('components/start_panel.html')

    initLoginButton()
    initSignupButton()
  } catch (error) {
    console.error('Error loading Start Panel:', error)
  }
}

function initLoginButton() {
  const loginButton = document.getElementById('login-button')
  const startPagePanel = document.getElementById('start-page-panel')
  let colorInfo = {
    hex: '',
    name: ''
  }

  addEventListenerTo(
    loginButton,
    'click',
    () => {
      initPanelShrinkAnim(startPagePanel)
      setTimeout(() => {
        loadLoginPanel()
      }, 1100)
    }
  )

  addEventListenerTo(
    loginButton,
    'mouseover',
    () => {
      colorInfo = getRandomColor(500)

      loginButton.style.backgroundColor = colorInfo['hex']
      loginButton.style.color = getColor(colorInfo['name'], 800)
    }
  )

  addEventListenerTo(
    loginButton,
    'mouseout',
    () => {
      loginButton.style.backgroundColor = getColor('charcoal', 700)
      loginButton.style.color = getColor('charcoal', 100)
    }
  )

  addEventListenerTo(
    loginButton,
    'mousedown',
    () => {
      loginButton.style.backgroundColor = getColor(colorInfo['name'], 700)
    }
  )

  addEventListenerTo(
    loginButton,
    'mouseup',
    () => {
      loginButton.style.backgroundColor = colorInfo['hex']
      loginButton.style.color = getColor(colorInfo['name'], 800)
    }
  )
}

function initSignupButton() {
  const signupButton = document.getElementById('signup-button')
  let colorInfo = {
    hex: '',
    name: ''
  }

  addEventListenerTo(
    signupButton,
    'click',
    () => loadSignupPanel()
  )

  addEventListenerTo(
    signupButton,
    'mouseover',
    () => {
      colorInfo = getRandomColor(500)

      signupButton.style.backgroundColor = colorInfo['hex']
      signupButton.style.color = getColor(colorInfo['name'], 800)
    }
  )

  addEventListenerTo(
    signupButton,
    'mouseout',
    () => {
      signupButton.style.backgroundColor = getColor('charcoal', 700)
      signupButton.style.color = getColor('charcoal', 100)
    }
  )

  addEventListenerTo(
    signupButton,
    'mousedown',
    () => {
      signupButton.style.backgroundColor = getColor(colorInfo['name'], 700)
    }
  )

  addEventListenerTo(
    signupButton,
    'mouseup',
    () => {
      signupButton.style.backgroundColor = colorInfo['hex']
      signupButton.style.color = getColor(colorInfo['name'], 800)
    }
  )
}

