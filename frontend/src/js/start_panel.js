import { verifyToken, refreshToken } from "./network_utils/token_utils.js";
import { loadPage, loadMainMenuContent } from "./router.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

async function initializeApp() {
  const is2FAVerified = localStorage.getItem('is2FAVerified')
  const is2FAEnabled = localStorage.getItem('is2FAEnabled')

  if (is2FAVerified === null) {
    localStorage.setItem('is2FAVerified', false)
  }
  if (is2FAEnabled === null) {
    localStorage.setItem('is2FAEnabled', false)
  }

  await refreshToken()

  if (await verifyToken()) {
    if (is2FAEnabled === 'true' && is2FAVerified === 'false') {
      loadPage('start')
      return
    }
    setInterval(refreshToken, 10 * 60 * 1000)
    await loadPage('main_menu')
    loadMainMenuContent('play')
    return
  }

  loadPage('start')
}
