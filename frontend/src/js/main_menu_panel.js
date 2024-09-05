
import { initHotbar } from "./ui_utils/hotbar_utils.js";
import { initAddFriendButton, loadToFriendsContainer, initCloseSearchFriendButton } from "./friends_content.js";
import { loadContent, loadContentToMainMenu } from "./router.js";

// document.addEventListener("DOMContentLoaded", () => {
//   loadMainMenuPanel()
// })

export async function loadMainMenuPanel() {
  try {
    window.history.pushState({}, '', '/main_menu');
    await loadContent()

    window.history.pushState({}, '', '/menu/play');
    await loadContentToMainMenu('play')
    initHotbar()
  } catch (error) {
    console.error('Error loading Main Menu Panel :', error)
  }
}

async function loadMenuContent(fileName) {
  if (fileName === 'friends_content.html') {
    await loadToFriendsContainer('friend_list_panel.html')
    initAddFriendButton()
  }
}


