
import { loadComponent } from "./utils/ui_utils.js";
import { initHotbar } from "./utils/hotbar_utils.js";

document.addEventListener("DOMContentLoaded", () => {
  loadMainMenuPanel()
})

export async function loadMainMenuPanel() {
  try {
    await loadComponent('components/menu/main_menu_panel.html')

    initHotbar()
    // await loadMainMenuContent('components/menu/play_content.html')
  } catch (error) {
    console.error('Error loading Main Menu Panel :', error)
  }
}

export async function loadMainMenuContent(path) {
  try {
    const response = await fetch(`/static/${path}`)
    const html = await response.text()

    document.querySelector('#main-menu-panel > .content-container').innerHTML = html;
  } catch (error) {
    console.error(`Error loading ${path}:`, error)
  }
}

