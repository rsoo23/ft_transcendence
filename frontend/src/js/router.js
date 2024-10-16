import { initHotbar, updateBorderColor, updateButtonState } from "./ui_utils/hotbar_utils.js";
import { initLink } from "./ui_utils/link_utils.js";
import { initBackButton, initRandomColorButton } from "./ui_utils/button_utils.js"
import { initTogglePasswordVisibilityIcon } from "./ui_utils/input_field_utils.js";
import { initAddFriendButton, loadFriendListContent } from "./friends_content.js"
import { handleLogin, handleForgotPassword } from "./login_panel.js";
import { handleSignup } from "./signup_panel.js"
import { changeAvatar, initFileInput, setDefaultAvatar, uploadAvatarImage } from "./settings.js";
import { initLogoutButton } from './logout.js';
import { initSettingsPage } from "./update_username.js";
import { getRequest } from "./network_utils/api_requests.js";
import { initEmailSettings } from "./update_email.js";
import { addEventListenerTo, loadContentToTarget } from "./ui_utils/ui_utils.js";
import { setUserInfo, userInfo } from "./global_vars.js";
import { initEditIcons } from "./settings.js";

const routes = {
  '/start': 'start_panel.html',
  '/login': 'login_panel.html',
  '/signup': 'signup_panel.html',
  '/avatar_upload': 'avatar_upload_panel.html',
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
    const html = await getRequest(`/static/components/${htmlPath}`, 'text')

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
    const html = await getRequest(`/static/components/${htmlPath}`, 'text')

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
          loadPage('login')
        }
      }
    )
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

  } else if (contentName === 'avatar_upload') {

    // initFileInput()
    // initRandomColorButton(
    //   'use-default-avatar-button',
    //   'avatar-upload-panel',
    //   () => {
    //     setDefaultAvatar()
    //   }
    // )
    // initRandomColorButton(
    //   'change-avatar-button',
    //   'avatar-upload-panel',
    //   () => {
    //     changeAvatar()
    //   }
    // )
    // initRandomColorButton(
    //   'confirm-avatar-upload-button',
    //   'avatar-upload-panel',
    //   async () => {
    //     const result = await uploadAvatarImage()
    //
    //     if (result === 'success') {
    //       loadPage('login')
    //     }
    //   }
    // )

  } else if (contentName === 'main_menu') {
    initHotbar()
    await loadUserInfo()
  } else if (contentName === 'friends') {

    await loadContentToTarget('menu/friend_list_panel.html', 'friends-container')
    await loadContentToTarget('menu/chat_demo.html', 'friends-content-container')
    initAddFriendButton()
    await loadFriendListContent()

  } else if (contentName === 'settings') {
    initFileInput()
    initEditIcons()
    initSettingsPage();
    initLogoutButton();
    initEmailSettings();
  }
}

async function loadUserInfo() {
  try {
    const response = await getRequest('/api/users/current_user/')

    console.log('userInfo: ', response)
    if (response) {
      setUserInfo(response)
    } else {
      console.error('Error: Failed to load userInfo')
    }
  } catch (error) {
    console.error(error)
  }
}
