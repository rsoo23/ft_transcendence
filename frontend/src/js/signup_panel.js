
export function loadSignupPanel() {
  fetch('/static/components/signup_panel.html')
    .then(response => response.text())
    .then(html => {
      document.body.innerHTML = html;
    })
    .catch(error => console.error('Error loading Signup Panel:', error));
}
