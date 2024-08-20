
import { loadLoginPanel } from "./login_panel.js";
import { getColor, getRandomColor } from "./utils/color_utils.js";
import { loadComponent } from "./utils/ui_utils.js";
import { addEventListenerTo } from "./utils/ui_utils.js";

document.addEventListener("DOMContentLoaded", () => {
  loadStartPage()
})

export async function loadStartPage() {
  try {
    await loadComponent('components/start_page.html')

    initLoginButton()

    // addEventListenerTo('signup-button', 'click', () => )

  } catch (error) {
    console.error('Error loading Start Page:', error)
  }
}

function initLoginButton() {
  const loginButton = document.getElementById('login-button')
  let colorInfo = {
    hex: '',
    name: ''
  }

  addEventListenerTo(
    loginButton,
    'click',
    () => loadLoginPanel()
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
}

