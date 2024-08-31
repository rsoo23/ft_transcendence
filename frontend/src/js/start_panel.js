
import { loadLoginPanel } from "./login_panel.js";
import { loadSignupPanel } from "./signup_panel.js";
import { getColor, getRandomColor } from "./utils/color_utils.js";
import { loadComponent } from "./utils/ui_utils.js";
import { addEventListenerTo } from "./utils/ui_utils.js";
import { initPanelShrinkAnim } from "./animations/ui_anim_utils.js";
import { ANIM_WAIT_DURATION } from "./constants.js";
import { verifyToken } from "./token_utils.js";
import { loadMainMenuPanel } from "./main_menu_panel.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

async function initializeApp() {
  try {
    const isTokenValid = await verifyToken();
    if (isTokenValid) {
      loadMainMenuPanel();
    } else {
      loadStartPanel();
    }
  } catch (error) {
    console.error('Error during app initialization:', error);
    loadStartPanel();
  }
}

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
      // initPanelShrinkAnim(startPagePanel)
      // setTimeout(() => {
      //   loadLoginPanel()
      // }, ANIM_WAIT_DURATION)
      loadLoginPanel()
    }
  )

  addEventListenerTo(
    loginButton,
    'mouseover',
    () => {
      colorInfo = getRandomColor(500)

      loginButton.style.backgroundColor = colorInfo['hex']
      startPagePanel.style.borderColor = colorInfo['hex']
      loginButton.style.color = getColor(colorInfo['name'], 800)
    }
  )

  addEventListenerTo(
    loginButton,
    'mouseout',
    () => {
      const color = getColor('charcoal', 100)

      loginButton.style.backgroundColor = getColor('charcoal', 700)
      startPagePanel.style.borderColor = color
      loginButton.style.color = color
    }
  )

  addEventListenerTo(
    loginButton,
    'mousedown',
    () => {
      const color = getColor(colorInfo['name'], 700)

      loginButton.style.backgroundColor = color
      startPagePanel.style.borderColor = color
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
  const startPagePanel = document.getElementById('start-page-panel')
  let colorInfo = {
    hex: '',
    name: ''
  }

  addEventListenerTo(
    signupButton,
    'click',
    () => {
      // initPanelShrinkAnim(startPagePanel)
      // setTimeout(() => {
      //   loadSignupPanel()
      // }, ANIM_WAIT_DURATION)
      loadSignupPanel()
    }
  )

  addEventListenerTo(
    signupButton,
    'mouseover',
    () => {
      colorInfo = getRandomColor(500)

      signupButton.style.backgroundColor = colorInfo['hex']
      startPagePanel.style.borderColor = colorInfo['hex']
      signupButton.style.color = getColor(colorInfo['name'], 800)
    }
  )

  addEventListenerTo(
    signupButton,
    'mouseout',
    () => {
      const color = getColor('charcoal', 100)

      signupButton.style.backgroundColor = getColor('charcoal', 700)
      startPagePanel.style.borderColor = color
      signupButton.style.color = color
    }
  )

  addEventListenerTo(
    signupButton,
    'mousedown',
    () => {
      const color = getColor(colorInfo['name'], 700)

      signupButton.style.backgroundColor = color
      startPagePanel.style.borderColor = color
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

