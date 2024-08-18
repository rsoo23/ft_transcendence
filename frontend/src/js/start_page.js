
function loadStartPage() {
  fetch('/static/components/start_page.html')
    .then(response => response.text())
    .then(html => {
      document.body.innerHTML = html;
    })
    .catch(error => console.error('Error loading Start Page:', error));
}

loadStartPage();

document.getElementById('login-button').addEventListener('click', (e) => {
});

document.getElementById('signup-button').addEventListener('click', (e) => {
});
