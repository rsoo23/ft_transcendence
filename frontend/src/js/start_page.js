
import { loadLoginPanel } from "./login_panel.js";
import { loadComponent } from "./utils/ui_utils.js";
import { addEventListenerTo } from "./utils/ui_utils.js";

document.addEventListener("DOMContentLoaded", () => {
  loadStartPage()
})

export async function loadStartPage() {
  try {
    await loadComponent('components/start_page.html')

    addEventListenerTo(
      'login-button',
      'click',
      () => loadLoginPanel()
    )
    // addEventListenerTo('signup-button', 'click', () => )
  } catch (error) {
    console.error('Error loading Start Page:', error)
  }
}
