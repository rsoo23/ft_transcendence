
import { loadComponent } from "./ui_utils/ui_utils.js"
import { initBackButton, initRandomColorButton } from "./ui_utils/button_utils.js"
import { loadLoginPanel } from "./login_panel.js"
import { loadMainMenuPanel } from "./main_menu_panel.js"

export async function load2FAPanel() {
  try {
    await loadComponent('components/2FA_panel.html')

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

