
const routes = {
  '/': 'start_panel.html',
  '/login': 'login_panel.html',
  '/signup': 'signup_panel.html',
  '/2fa': '2FA_panel.html',
  '/play': '/menu/play_content.html',
  '/stats': '/menu/stats_content.html',
  '/friends': '/menu/friends_content.html',
  '/how_to_play': '/menu/how_to_play_content.html',
  '/settings': '/menu/settings_content.html'
}

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
export async function loadContentToMainMenu() {
  const path = window.location.pathname;
  const htmlPath = routes[path] || '<h1>404 Page Not Found</h1>';

  try {
    const response = await fetch(`/static/components/menu/${htmlPath}`)
    const html = await response.text()

    document.querySelector('#main-menu-panel > .content-container').innerHTML = html;
  } catch (error) {
    console.error(`Error loading ${htmlPath}:`, error)
  }
}
