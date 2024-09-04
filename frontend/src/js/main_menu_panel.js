
import { initHotbar } from "./ui_utils/hotbar_utils.js";
import { initAddFriendButton, loadToFriendsContainer, initCloseSearchFriendButton } from "./friends_content.js";
import { loadContent, loadContentToMainMenu } from "./router.js";

// document.addEventListener("DOMContentLoaded", () => {
//   loadMainMenuPanel()
// })

export async function loadMainMenuPanel() {
  try {
    window.history.pushState({}, '', '/');
    await loadContent()

    initHotbar()
    window.history.pushState({}, '', '/play');
    await loadContentToMainMenu()
  } catch (error) {
    console.error('Error loading Main Menu Panel :', error)
  }
}
//
// export async function loadMainMenuContent(fileName) {
//   try {
//     const response = await fetch(`/static/components/menu/${fileName}`)
//     const html = await response.text()
//
//     document.querySelector('#main-menu-panel > .content-container').innerHTML = html;
//     loadContent(fileName)
//   } catch (error) {
//     console.error(`Error loading static/components/menu/${fileName}:`, error)
//   }
// }
//
// async function loadContent(fileName) {
//   if (fileName === 'friends_content.html') {
//     await loadToFriendsContainer('friend_list_panel.html')
//     initAddFriendButton()
//   }
// }
//

