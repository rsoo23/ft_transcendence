
import { loadLoginPanel } from "./login_panel.js";
import { loadContent } from "./router.js";
import { loadSignupPanel } from "./signup_panel.js";
import { initRandomColorButton } from "./ui_utils/button_utils.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

async function initializeApp() {
  // try {
  //   const isTokenValid = await verifyToken();
  //   if (isTokenValid) {
  //     loadMainMenuPanel();
  //   } else {
  //     loadStartPanel();
  //   }
  // } catch (error) {
  //   console.error('Error during app initialization:', error);
  //   loadStartPanel();
  // }
  loadStartPanel()
}

export async function loadStartPanel() {
  try {
    window.history.pushState({}, '', '/');
    await loadContent()

    initRandomColorButton(
      'login-button',
      'start-page-panel',
      () => {
        loadLoginPanel()
      }
    )
    initRandomColorButton(
      'signup-button',
      'start-page-panel',
      () => {
        loadSignupPanel()
      }
    )
  } catch (error) {
    console.error('Error loading Start Panel:', error)
  }
}

