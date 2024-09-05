import { updateBorderColor, updateButtonState } from "./ui_utils/hotbar_utils.js";
import { loadToFriendsContainer, initAddFriendButton } from "./friends_content.js"

const routes = {
  '/': 'start_panel.html',
  '/login': 'login_panel.html',
  '/signup': 'signup_panel.html',
  '/2fa': '2FA_panel.html',
  '/main_menu': 'menu/main_menu_panel.html',
  '/menu/play': 'menu/play_content.html',
  '/menu/stats': 'menu/stats_content.html',
  '/menu/friends': 'menu/friends_content.html',
  '/menu/how-to-play': 'menu/how_to_play_content.html',
  '/menu/settings': 'menu/settings_content.html'
}

// function that manages back and forth history
window.addEventListener('popstate', (event) => {
  const path = window.location.pathname;
  // console.warn('window path: ', path)
  if (path.startsWith('/menu')) {
    const contentName = path.substring(path.lastIndexOf('/') + 1);

    loadContentToMainMenu(contentName);
  } else {
    loadContent();
  }
});

// Function to update the content based on the current route
export async function loadContent() {
  const path = window.location.pathname;
  const htmlPath = routes[path] || '<h1>404 Page Not Found</h1>';

  try {
    const response = await fetch(`/static/components/${htmlPath}`)
    const html = await response.text()

    document.body.innerHTML = html;
  } catch (error) {
    console.error(`Error loading ${htmlPath}:`, error)
  }
}

// Function to update the content (add to the main menu) based on the current route
export async function loadContentToMainMenu(contentName) {
  const path = window.location.pathname;
  const htmlPath = routes[path] || '<h1>404 Page Not Found</h1>';

  try {
    const response = await fetch(`/static/components/${htmlPath}`)
    const html = await response.text()

    document.querySelector('#main-menu-panel > .content-container').innerHTML = html;

    updateBorderColor(contentName)
    updateButtonState(contentName)
    loadDynamicContent(contentName)
  } catch (error) {
    console.error(`Error loading ${htmlPath}:`, error)
  }
}

// - loads dynamic content after loading content to main menu
// - initializes event listeners for any ui components
async function loadDynamicContent(contentName) {
  if (contentName === 'friends') {
    await loadToFriendsContainer('friend_list_panel.html')
    initAddFriendButton()
  }
}


