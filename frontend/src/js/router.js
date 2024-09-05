
const routes = {
  '/': 'start_panel.html',
  '/login': 'login_panel.html',
  '/signup': 'signup_panel.html',
  '/2fa': '2FA_panel.html',
  '/main_menu': '/menu/main_menu_panel.html',
  '/menu/play': '/menu/play_content.html',
  '/menu/stats': '/menu/stats_content.html',
  '/menu/friends': '/menu/friends_content.html',
  '/menu/how_to_play': '/menu/how_to_play_content.html',
  '/menu/settings': '/menu/settings_content.html'
}

// function that manages back and forth history
window.addEventListener('popstate', (event) => {
  const path = window.location.pathname;
  // console.warn('window path: ', path)
  if (path.startsWith('/menu')) {
    loadContentToMainMenu(); // Handle main menu routing
  } else {
    loadContent(); // Handle default content routing
  }
});

// Function to update the content based on the current route
export async function loadContent(target) {
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
    const response = await fetch(`/static/components/${htmlPath}`)
    const html = await response.text()

    document.querySelector('#main-menu-panel > .content-container').innerHTML = html;
  } catch (error) {
    console.error(`Error loading ${htmlPath}:`, error)
  }
}
