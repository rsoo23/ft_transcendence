
import { loadStartPage } from "./start_page.js";
import { loadComponent } from "./utils/ui_utils.js";
import { addEventListenerTo } from "./utils/ui_utils.js";

export async function loadLoginPanel() {
  try {
    await loadComponent('components/login_panel.html')

    addEventListenerTo(
      'back-to-start-button',
      'click',
      () => loadStartPage()
    )

    // addEventListenerTo('signup-button', 'click', () => loadComponent('components/signup_panel.html'))
  } catch (error) {
    console.error('Error loading Login Panel:', error)
  }
}
