
import { initBackButton, initRandomColorButton } from "./ui_utils/button_utils.js"
import { loadLoginPanel } from "./login_panel.js"
import { loadMainMenuPanel } from "./main_menu_panel.js"
import { loadContent } from "./router.js";

export async function load2FAPanel() {
  try {
    window.history.pushState({}, '', '/2fa');
    await loadContent()

    initBackButton(() => loadLoginPanel())
    initRandomColorButton(
      'confirm-2fa-button',
      'two-fa-panel',
      () => {
        loadMainMenuPanel()
      }
    )
    initConfirm2FAButton()
  } catch (error) {
    console.error('Error loading 2FA Panel:', error)
  }
}

