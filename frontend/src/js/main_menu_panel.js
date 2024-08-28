
import { loadComponent } from "./utils/ui_utils.js";
import { initHotbar } from "./utils/hotbar_utils.js";
import { initAddFriendButton, loadToFriendsContainer } from "./friends_content.js";

document.addEventListener("DOMContentLoaded", () => {
  loadMainMenuPanel()
})

export async function loadMainMenuPanel() {
  try {
    await loadComponent('components/menu/main_menu_panel.html')

    initHotbar()
    // await loadMainMenuContent('play_content.html')
  } catch (error) {
    console.error('Error loading Main Menu Panel :', error)
  }
}

export async function loadMainMenuContent(fileName) {
  try {
    const response = await fetch(`/static/components/menu/${fileName}`)
    const html = await response.text()

    document.querySelector('#main-menu-panel > .content-container').innerHTML = html;
    loadContent(fileName)
  } catch (error) {
    console.error(`Error loading static/components/menu/${fileName}:`, error)
  }
}

async function loadContent(fileName) {
  if (fileName === 'friends_content.html') {
    await loadToFriendsContainer('friend_list_panel.html')
    initAddFriendButton()
  }
}


