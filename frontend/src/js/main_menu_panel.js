
import { loadComponent } from "./utils/ui_utils.js";
import { addEventListenerTo } from "./utils/ui_utils.js";
import { getColor, getRandomColor } from "./utils/color_utils.js";

document.addEventListener("DOMContentLoaded", () => {
  loadMainMenuPanel()
})

export async function loadMainMenuPanel() {
  try {
    await loadComponent('components/menu/main_menu_panel.html')

  } catch (error) {
    console.error('Error loading Main Menu Panel :', error)
  }
}
