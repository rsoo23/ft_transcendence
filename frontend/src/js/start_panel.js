import { verifyToken } from "./network_utils/token_utils.js";
import { loadPage, loadMainMenuContent } from "./router.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

async function initializeApp() {
  if (await verifyToken()) {
    loadPage('main_menu')
    loadMainMenuContent('play')
    return
  }

  loadPage('start')
}
