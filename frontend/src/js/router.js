import { initHotbar, updateBorderColor, updateButtonState } from "./ui_utils/hotbar_utils.js";
import { initLink } from "./ui_utils/link_utils.js";
import { initBackButton, initRandomColorButton } from "./ui_utils/button_utils.js"
import { initTogglePasswordVisibilityIcon } from "./ui_utils/input_field_utils.js";
import { loadToFriendsContainer, initAddFriendButton } from "./friends_content.js"
import { handleLogin, handleForgotPassword } from "./login_panel.js";
import { handleSignup, initEnable2FAButton } from "./signup_panel.js"
import { changeAvatar, initFileInput, setDefaultAvatar } from "./user_profile_panel.js";
import { initLogoutButton } from './logout.js';
import { initSettingsPage } from "./update_username.js";

const routes = {
  '/start': 'start_panel.html',
  '/login': 'login_panel.html',
  '/signup': 'signup_panel.html',
  '/user_profile': 'user_profile_panel.html',
  '/2fa': '2FA_panel.html',
  '/main_menu': 'menu/main_menu_panel.html',
  '/menu/play': 'menu/play_content.html',
  '/menu/stats': 'menu/stats_content.html',
  '/menu/friends': 'menu/friends_content.html',
  '/menu/how-to-play': 'menu/how_to_play_content.html',
  '/menu/settings': 'menu/settings_content.html'
}

// manages back and forth history
window.addEventListener('popstate', (event) => {
  const path = window.location.pathname;
  const urlSegments = path.split('/')
  const lastUrlSegment = urlSegments.pop()

  if (path.startsWith('/menu')) {
    loadContentToMainMenu(lastUrlSegment);
  } else if (path.startsWith('/main_menu')) {
    loadPage('main_menu');
    loadMainMenuContent('play');
  } else {
    loadContent(lastUrlSegment);
  }
});

// update the content (added to the body) based on the current route
export async function loadContent(contentName) {
  const path = window.location.pathname;
  const htmlPath = routes[path] || '<h1>404 Page Not Found</h1>';

  try {
    const response = await fetch(`/static/components/${htmlPath}`)
    const html = await response.text()

    document.body.innerHTML = html;

    loadDynamicContent(contentName)

  } catch (error) {
    console.error(`Error loading ${htmlPath}:`, error)
  }
}

// update the content (added to the main menu) based on the current route
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

export async function loadPage(contentName) {
  window.history.pushState({}, '', `/${contentName}`);
  await loadContent(contentName)
}

export async function loadMainMenuContent(contentName) {
  window.history.pushState({}, '', `/menu/${contentName}`);
  await loadContentToMainMenu(contentName)
}

// - loads dynamic content after loading content to main menu
// - initializes event listeners for any ui components
async function loadDynamicContent(contentName) {
  if (contentName === 'start') {

    initRandomColorButton(
      'login-button',
      'start-page-panel',
      () => loadPage('login')
    )
    initRandomColorButton(
      'signup-button',
      'start-page-panel',
      () => loadPage('signup')
    )

  } else if (contentName === 'login') {

    initBackButton(
      () => loadPage('start')
    )
    initRandomColorButton(
      'confirm-login-button',
      'login-panel',
      async () => {
        const result = await handleLogin()

        if (result === 'success-with-2fa') {
          load2FAPanel()
        } else if (result === 'success') {
          loadPage('main_menu')
          loadMainMenuContent('play')
        }
      }
    )
    initTogglePasswordVisibilityIcon()
    initLink(
      'forgot-password-link',
      () => handleForgotPassword()
    )

  } else if (contentName === 'signup') {

    initBackButton(
      () => loadPage('start')
    )
    initRandomColorButton(
      'confirm-signup-button',
      'signup-panel',
      async () => {
        const result = await handleSignup()

        if (result === 'success') {
          loadPage('user_profile')
        }
      }
    )
    initEnable2FAButton()
    initTogglePasswordVisibilityIcon()

  } else if (contentName === '2fa') {

    initBackButton(() => loadPage('login'))
    initRandomColorButton(
      'confirm-2fa-button',
      'two-fa-panel',
      () => {
        loadPage('main_menu')
        loadMainMenuContent('play')
      }
    )

  } else if (contentName === 'user_profile') {

    initBackButton(() => loadPage('signup'))
    initFileInput()
    initRandomColorButton(
      'use-default-avatar-button',
      'user-profile-panel',
      () => {
        setDefaultAvatar()
      }
    )
    initRandomColorButton(
      'change-avatar-button',
      'user-profile-panel',
      () => {
        changeAvatar()
      }
    )
    initRandomColorButton(
      'confirm-user-profile-button',
      'user-profile-panel',
      () => {
        loadPage('main_menu')
        loadMainMenuContent('play')
      }
    )

  } else if (contentName === 'main_menu') {
    initHotbar()
  } else if (contentName === 'friends') {

    await loadToFriendsContainer('friend_list_panel.html')
    initAddFriendButton()

  } else if (contentName == 'settings') {
	initSettingsPage();
	initLogoutButton();
	}
}

