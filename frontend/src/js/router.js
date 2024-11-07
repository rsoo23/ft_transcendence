import {
  initHotbar,
  updateBorderColor,
  updateButtonState,
} from "./ui_utils/hotbar_utils.js";
import {
  initBackButton,
  initRandomColorButton,
} from "./ui_utils/button_utils.js";
import { initTogglePasswordVisibilityIcon } from "./ui_utils/input_field_utils.js";
import {
  FRIEND_LIST_STATE,
  loadFriendListPanel,
  loadFriendSearchPanel,
} from "./friends_system/utils.js";
import { handle2FA, initResendCodeButton } from "./2FA_panel.js";
import { send_otp_2FA } from "./network_utils/2FA_utils.js";
import { check_email } from "./forgot_password/get_email.js";
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
import {
  closeFriendSystemSocket,
  connectFriendSystemSocket,
} from "./friends_system/websocket.js";
import {
  setLocalPlayMode,
  getLocalPlayMode,
  initPanelBacklog,
  setCurrentPanel,
  setCurrentDiv,
  loadMultiplayerTest,
  startLocalGame,
} from "./play_panel.js";
import { initLink } from "./ui_utils/link_utils.js";
import { closeUserUpdateSocket, connectUserUpdateSocket } from "./user_updates/websocket.js";
import { init2FAToggle } from "./2FA_panel.js";
import { generateArcBackground, generateGeometricBackground, getRandomInt, loadMainBackground, removeBackground, setBackgroundLinesColor } from "./animations/main_background.js";

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

    const type = getRandomInt(0, 1)

    switch (type) {
      case 0:
        generateGeometricBackground()
        break
      case 1:
        generateArcBackground()
        break
    }
  }
  );
}

async function initLoginPage() {
  const doLogin = async () => {
    const result = await handleLogin();

    if (result === "success-with-2fa") {
      loadPage("2fa_verify");
    } else if (result === "success") {
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
}

async function initPlayPage() {
  const moveAToB = (e1, e2) => {
    const e1Rect = e1.getBoundingClientRect();
    const e2Rect = e2.getBoundingClientRect();
    e1.style.top = `-${e1Rect.top - e2Rect.top}px`;
  };

  const playTypeButtons = document.getElementById("playtype");
  const gamemodeButtons = document.getElementById("gamemode");
  const hostJoinButtons = document.getElementById("hostjoin");
  const gameSelectDiv = document.getElementById("play-select-container");
  const gameSettingsDiv = document.getElementById("play-settings-container");
  moveAToB(gamemodeButtons, playTypeButtons);
  moveAToB(hostJoinButtons, playTypeButtons);
  moveAToB(gameSettingsDiv, gameSelectDiv);
  initPanelBacklog(
    [playTypeButtons, gamemodeButtons, hostJoinButtons],
    [gameSelectDiv, gameSettingsDiv],
    playTypeButtons
  );

  // first page
  document.getElementById("localplay").onclick = () => {
    setLocalPlayMode(true);
    setCurrentPanel(playTypeButtons, gamemodeButtons);
  };
  document.getElementById("onlineplay").onclick = () => {
    setLocalPlayMode(false);
    setCurrentPanel(playTypeButtons, gamemodeButtons);
  };

  // second page
  document.getElementById("gamemodeback").onclick = () =>
    setCurrentPanel(gamemodeButtons, playTypeButtons);
  document.getElementById("quickplay").onclick = async () => {
    if (getLocalPlayMode()) {
      await loadContentToTarget(
        "menu/play_settings_content.html",
        "play-settings-container"
      );
      document.getElementById("settingsback").onclick = () =>
        setCurrentDiv(gameSettingsDiv, gameSelectDiv);
      document.getElementById("start-game").onclick = () => startLocalGame();
      setCurrentDiv(gameSelectDiv, gameSettingsDiv);
      return;
    }

    setCurrentPanel(gamemodeButtons, hostJoinButtons);
  };
  document.getElementById("tournament").onclick = () => {
    alert("not implemented yet :[");
  };

  // third page (online only)
  document.getElementById('hostjoinback').onclick = () => setCurrentPanel(hostJoinButtons, gamemodeButtons)
  document.getElementById('host').onclick = () => {
    loadMultiplayerTest()
    setCurrentDiv(gameSelectDiv, gameSettingsDiv)
  }
  document.getElementById('join').onclick = () => alert('not implemented')

  connectUserUpdateSocket()
  connectFriendSystemSocket()
}

async function initStatsPage() { }

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

      loadPage("main_menu");
      if (contentName === "2fa_verify") {
        loadMainMenuContent("play");
      } else {
        loadMainMenuContent("settings");
      }
    });
  }
}
