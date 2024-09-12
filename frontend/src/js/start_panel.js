
import { loadContent, loadPage } from "./router.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

async function initializeApp() {
  // try {
  //   const isTokenValid = await verifyToken();
  //   if (isTokenValid) {
  //     loadMainMenuPanel();
  //   } else {
  //     loadStartPanel();
  //   }
  // } catch (error) {
  //   console.error('Error during app initialization:', error);
  //   loadStartPanel();
  // }
  loadPage('start')
}
