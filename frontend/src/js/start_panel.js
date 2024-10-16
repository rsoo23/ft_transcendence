
import { loadPage } from "./router.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

async function initializeApp() {
  loadPage('start')
}
