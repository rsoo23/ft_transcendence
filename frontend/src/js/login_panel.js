
export function showLoginPanel() {
  fetch('/static/components/login_panel.html')
    .then(response => response.text())
    .then(html => {
      document.body.innerHTML = html;
    })
    .catch(error => console.error('Error loading Login Panel:', error));
}
