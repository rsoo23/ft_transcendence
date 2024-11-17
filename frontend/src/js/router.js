import { initHotbar, updateBorderColor, updateButtonState, } from "./ui_utils/hotbar_utils.js";
import { initBackButton, initRandomColorButton, } from "./ui_utils/button_utils.js";
import { initTogglePasswordVisibilityIcon } from "./ui_utils/input_field_utils.js";
import { FRIEND_LIST_STATE, loadFriendListPanel, loadFriendSearchPanel, } from "./friends_system/utils.js";
import { handle2FA, initResendCodeButton } from "./2FA_panel.js";
import { send_otp_2FA } from "./network_utils/2FA_utils.js";
import { check_email, initEmailForm } from "./forgot_password/get_email.js";
import { verify_code } from "./forgot_password/verify_code.js";
import { handle_change_password } from "./forgot_password/change_password.js";
import { handleLogin } from "./login_panel.js";
import { handleSignup } from "./signup_panel.js";
import { initAvatarUpload } from "./settings/upload_avatar.js";
import { initLogoutButton } from "./settings/logout.js";
import { getRequest } from "./network_utils/api_requests.js";
import { initEmailSettings } from "./settings/update_email.js";
import { loadContentToTarget } from "./ui_utils/ui_utils.js";
import { currentPageState, PAGE_STATE, setCurrentPageState, setCurrentUserInfo, setUsersInfo } from "./global_vars.js";
import { initPasswordSettings } from "./settings/update_password.js";
import { closeChatSocket } from "./realtime_chat/websocket.js";
import { initUsernameSettings } from "./settings/update_username.js";
import { closeFriendSystemSocket, connectFriendSystemSocket, } from "./friends_system/websocket.js";
import { initPlayDivs, startingMenuSwitcher, divSwitcher, loadMultiplayerTest, startLocalGame, } from "./play_panel.js";
import { initLink } from "./ui_utils/link_utils.js";
import { initClassicLobby, updateClassicLobby, getInLobby, createLobby, joinLobby, } from "./lobby.js";
import { initLobbyList, closeLobbyListSocket, } from "./lobby_list.js";
import { closeUserUpdateSocket, connectUserUpdateSocket } from "./user_updates/websocket.js";
import { init2FAToggle } from "./2FA_panel.js";
import { generateArcBackground, generateGeometricBackground, getRandomInt, loadMainBackground, removeBackground, setBackgroundLinesColor } from "./animations/main_background.js";
import { refreshToken } from "./network_utils/token_utils.js";
import { initVerifyForm } from "./forgot_password/verify_code.js";
import { initChangePasswordForm } from "./forgot_password/change_password.js";
import { loadStatsPage } from "./stats_content.js";

const routes = {
  "/start": "start_panel.html",
  "/login": "login_panel.html",
  "/signup": "signup_panel.html",
  "/user_profile": "user_profile_panel.html",
  "/2fa_verify": "2FA_panel.html",
  "/2fa_enable": "2FA_panel.html",
  "/main_menu": "menu/main_menu_panel.html",
  "/menu/play": "menu/play_content.html",
  "/menu/stats": "menu/stats_content.html",
  "/menu/friends": "menu/friends_content.html",
  "/menu/how-to-play": "menu/how_to_play_content.html",
  "/menu/settings": "menu/settings_content.html",
  "/forgot_password/get_email": "forgot_password/get_email.html",
  "/forgot_password/verify_code": "forgot_password/verify_code.html",
  "/forgot_password/change_password": "forgot_password/change_password.html",
  "/game": "game.html",
};

// manages back and forth history
window.addEventListener("popstate", async (event) => {
  const path = window.location.pathname;
  const urlSegments = path.split("/");
  const lastUrlSegment = urlSegments.pop();

  if (path.startsWith("/menu")) {
    loadContentToMainMenu(lastUrlSegment);
  } else if (path.startsWith('/main_menu')) {
    await loadPage('main_menu');
    await loadMainMenuContent('play');
    setCurrentPageState(PAGE_STATE.IN_PLAY_PAGE)
  } else {
    loadContent(lastUrlSegment);
    setCurrentPageState(PAGE_STATE.NOT_IN_MENU_PAGE)
  }

  if (!path.startsWith('/menu/friends')) {
    closeChatSocket()
  } else if (!path.startsWith('/menu')) {
    closeFriendSystemSocket()
    closeUserUpdateSocket()
  }

  if (!path.startsWith('/menu/play')) {
    closeLobbyListSocket()
  }
});

// update the content (added to the body) based on the current route
export async function loadContent(contentName) {
  const path = window.location.pathname;
  const htmlPath = routes[path] || "<h1>404 Page Not Found</h1>";

  try {
    const html = await getRequest(`/static/components/${htmlPath}`, "text");

    document.getElementById('inner-body').innerHTML = html;

    loadDynamicContent(contentName);
  } catch (error) {
    console.error(`Error loading ${htmlPath}:`, error);
  }
}

// update the content (added to the main menu) based on the current route
export async function loadContentToMainMenu(contentName) {
  const path = window.location.pathname;
  const htmlPath = routes[path] || "<h1>404 Page Not Found</h1>";

  try {
    const html = await getRequest(`/static/components/${htmlPath}`, "text");

    document.querySelector("#main-menu-panel > .content-container").innerHTML =
      html;

    if (contentName !== 'friends') {
      closeChatSocket()
    }
    updateBorderColor(contentName);
    updateButtonState(contentName);
    loadDynamicContent(contentName);
  } catch (error) {
    console.error(`Error loading ${htmlPath}:`, error);
  }
}

export async function loadPage(contentName) {
  window.history.pushState({}, "", `/${contentName}`);
  await loadContent(contentName);
}

export async function loadMainMenuContent(contentName) {
  window.history.pushState({}, "", `/menu/${contentName}`);
  await loadContentToMainMenu(contentName);
}

// - loads dynamic content after loading content to main menu
// - initializes event listeners for any ui components
async function loadDynamicContent(contentName) {
  switch (contentName) {
    case 'start':
      initStartPage()
      break
    case 'login':
      initLoginPage()
      break
    case 'signup':
      initSignupPage()
      break
    case 'main_menu':
      initMainMenuPage()
      break
    case 'play':
      initPlayPage()
      setCurrentPageState(PAGE_STATE.IN_PLAY_PAGE)
      break
    case 'game':
      // TODO: move game stuff here
      break
    case 'friends':
      initFriendsPage()
      setCurrentPageState(PAGE_STATE.IN_FRIENDS_PAGE)
      break
    case 'stats':
      initStatsPage()
      setCurrentPageState(PAGE_STATE.IN_STATS_PAGE)
      break
    case 'how-to-play':
      initHowToPlayPage()
      setCurrentPageState(PAGE_STATE.IN_HOW_TO_PLAY_PAGE)
      break
    case 'settings':
      initSettingsPage()
      setCurrentPageState(PAGE_STATE.IN_SETTINGS_PAGE)
      break
    case 'forgot_password/get_email':
      initGetEmailPage()
      break
    case 'forgot_password/verify_code':
      initVerifyCodePage()
      break
    case 'forgot_password/change_password':
      initChangePasswordPage()
      break
    case 'forgot_password/change_password':
      initChangePasswordPage()
      break
    case '2fa_verify':
      init2FAPages(contentName)
      break
    case '2fa_enable':
      init2FAPages(contentName)
      break
    default:
      console.error("Error: invalid contentName");
  }
}

async function loadCurrentUserInfo() {
  try {
    const response = await getRequest("/api/users/current_user/");

    console.log("userInfo: ", response);
    if (response) {
      setCurrentUserInfo(response);
    } else {
      console.error("Error: Failed to load userCurrentInfo");
    }
  } catch (error) {
    console.error(error);
  }
}

export async function loadUsersInfo() {
  try {
    const response = await getRequest("/api/users/");

    console.log("usersInfo: ", response);
    if (response) {
      setUsersInfo(response);
    } else {
      console.error("Error: Failed to load userInfo");
    }
  } catch (error) {
    console.error(error);
  }
}

async function initStartPage() {
  loadMainBackground()
  initRandomColorButton("login-button", "start-page-panel", () =>
    loadPage("login")
  );
  initRandomColorButton("signup-button", "start-page-panel", () =>
    loadPage("signup")
  );
  initRandomColorButton("surprise-button", "start-page-panel", () => {
    removeBackground()
    loadMainBackground()
  }
  );
}

async function initLoginPage() {
  const doLogin = async () => {
    const result = await handleLogin();

    if (result === "success-with-2fa") {
      loadPage("2fa_verify");
    } else if (result === "success") {
      setInterval(refreshToken, 10 * 60 * 1000)
      await loadPage("main_menu");
      loadMainMenuContent("play");
    }
  };

  initBackButton(() => loadPage("start"));
  initRandomColorButton("confirm-login-button", "login-panel", doLogin);
  initTogglePasswordVisibilityIcon();
  initLink("forgot-password-link", () => loadPage("forgot_password/get_email"));

  const form = document.getElementById("login-form");

  form.onsubmit = (e) => {
    e.preventDefault();
    doLogin();
  };
}

async function initSignupPage() {
  const doRegister = async () => {
    const result = await handleSignup();

    if (result === "success") {
      loadPage("login");
    }
  };

  initBackButton(() => loadPage("start"));
  initRandomColorButton("confirm-signup-button", "signup-panel", doRegister);
  initTogglePasswordVisibilityIcon();
  const form = document.getElementById("signup-form");
  form.onsubmit = (e) => {
    e.preventDefault();
    doRegister();
  };
}

async function initMainMenuPage() {
  loadMainBackground()
  initHotbar();
  await loadCurrentUserInfo();
  await loadUsersInfo();

  connectUserUpdateSocket()
  connectFriendSystemSocket()
}

async function initPlayPage() {
  const playTypeButtons = document.getElementById('playtype')
  const gamemodeButtons = document.getElementById('gamemode')
  const gameSelectDiv = document.getElementById('play-select-container')
  const gameLobbyListDiv = document.getElementById('play-lobby-list-container')
  const gameSettingsDiv = document.getElementById('play-settings-container')
  const gameLobbyDiv = document.getElementById('play-lobby-container')
  initPlayDivs();

  // first page
  document.getElementById("localplay").onclick = async () => {
    startingMenuSwitcher.disableDivInput('play-select-container')
    await loadContentToTarget('menu/play_settings_content.html', 'play-settings-container')
    document.getElementById('settingsback').onclick = () => divSwitcher.setCurrentDiv('play-settings-container', 'play-select-container')
    document.getElementById('start-game').onclick = () => startLocalGame()
    divSwitcher.setCurrentDiv('play-select-container', 'play-settings-container')
  };
  document.getElementById("onlineplay").onclick = () => {
    startingMenuSwitcher.setCurrentDiv('playtype', 'gamemode')
  };

  // second page
  const goToLobbyList = async () => {
    divSwitcher.disableDivInput('play-select-container')
    await loadContentToTarget('menu/lobby_list_content.html', 'play-lobby-list-container')
    document.getElementById('lobbylistback').onclick = () => {
      closeLobbyListSocket()
      divSwitcher.setCurrentDiv('play-lobby-list-container', 'play-select-container')
    }
    document.getElementById('lobby-host-button').onclick = async () => {
      divSwitcher.disableDivInput('play-select-container')
      // TODO: move this to lobby stuff
      await loadContentToTarget('menu/lobby_classic_content.html', 'play-lobby-container')
      closeLobbyListSocket()
      const lobbyID = await createLobby()
      await joinLobby(lobbyID)
      initClassicLobby('play-lobby-list-container')
      divSwitcher.setCurrentDiv('play-lobby-list-container', 'play-lobby-container')
      updateClassicLobby()
    }
    initLobbyList()
    divSwitcher.setCurrentDiv('play-select-container', 'play-lobby-list-container')
  }
  document.getElementById("gamemodeback").onclick = () => startingMenuSwitcher.setCurrentDiv('gamemode', 'playtype');
  document.getElementById("quickplay").onclick = () => goToLobbyList()
  document.getElementById("tournament").onclick = () => alert("not implemented yet :[");

  // lobby page
  if (getInLobby()) {
    divSwitcher.disableDivInput('play-select-container')
    await loadContentToTarget('menu/lobby_classic_content.html', 'play-lobby-container')
    initClassicLobby('play-select-container')
    divSwitcher.setCurrentDiv('play-select-container', 'play-lobby-container', true)
    updateClassicLobby()
  }
}

async function initStatsPage() {
	await loadStatsPage();
}

export async function initFriendsPage(
  state = FRIEND_LIST_STATE.SHOWING_FRIEND_LIST
) {
  if (state === FRIEND_LIST_STATE.SHOWING_FRIEND_LIST) {
    await loadFriendListPanel();
  } else if (state === FRIEND_LIST_STATE.SHOWING_FRIEND_SEARCH_LIST) {
    await loadFriendSearchPanel();
  }

  await loadContentToTarget('menu/chat_demo.html', 'friends-content-container')
}

async function initHowToPlayPage() { }

async function initSettingsPage() {
  initAvatarUpload();
  initUsernameSettings();
  initLogoutButton();
  initEmailSettings();
  initPasswordSettings();
  init2FAToggle();
}

function initGetEmailPage() {
  initBackButton(() => loadPage("login"));
  initEmailForm();
  initRandomColorButton("submit-email-button", "get-email-panel", async () => {
    const result = await check_email();

    if (result === "error") {
      return;
    }
    loadPage("forgot_password/verify_code");
  });
}

function initVerifyCodePage() {
  initBackButton(() => loadPage("forgot_password/get_email"));
  initVerifyForm();
  initRandomColorButton("submit-code-button", "verify-code-panel", async () => {
    const result = await verify_code();

    if (result === "error") {
      return;
    }
    loadPage("forgot_password/change_password");
  });
}

function initChangePasswordPage() {
  initBackButton(() => loadPage("forgot_password/verify_code"));
  initTogglePasswordVisibilityIcon();
  initChangePasswordForm();
  initRandomColorButton(
    "confirm-signup-button",
    "verify-code-panel",
    async () => {
      const result = await handle_change_password();

      if (result === "error") {
        return;
      }
      loadPage("login");
    }
  );
}

function init2FAPages(contentName) {
  if (contentName === "2fa_verify" || contentName === "2fa_enable") {
    send_otp_2FA();
    if (contentName === "2fa_verify") {
      initBackButton(() => loadPage("login"));
    } else {
      initBackButton(() => {
        loadPage("main_menu");
        loadMainMenuContent("settings");
      });
    }
    initResendCodeButton(() => send_otp_2FA());
    initRandomColorButton("submit-2fa-button", "two-fa-panel", async () => {
      const result = await handle2FA();

      if (result === "error") {
        return;
      }

      if (contentName === "2fa_enable") {
        const twoFactorToggle = document.querySelector(".profile-settings-toggle-input");
        if (twoFactorToggle) {
          twoFactorToggle.checked = true;
        }
      }

      loadPage("main_menu");
      if (contentName === "2fa_verify") {
        loadMainMenuContent("play");
      } else {
        loadMainMenuContent("settings");
      }
    });
  }
}
