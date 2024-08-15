
function loadStartPage() {
  fetch('/static/components/start_page.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('app').innerHTML = html;
    })
    .catch(error => console.error('Error loading Start Page:', error));
}

loadStartPage();
