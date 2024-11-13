import { PanelSwitcher } from "./ui_utils/panelswitcher_utils.js"

export var howToPlayPageSwitcher = null

export function initHowToPlayDivs() {
  const page1 = document.getElementById('how-to-play-page-1')
  const page2 = document.getElementById('how-to-play-page-2')
  const page3 = document.getElementById('how-to-play-page-3')
  const page4 = document.getElementById('how-to-play-page-4')
  const page5 = document.getElementById('how-to-play-page-5')

  const pages = [page1, page2, page3, page4, page5]

  howToPlayPageSwitcher = new PanelSwitcher(page1, pages)

  pages.forEach((page, index) => {
    if (index !== pages.length - 1) {
      page.querySelector('.forward-button').onclick = () => howToPlayPageSwitcher.setCurrentDiv(
        page.id,
        pages[index + 1].id,
      )
    }
    if (index !== 0) {
      page.querySelector('.back-button').onclick = () => howToPlayPageSwitcher.setCurrentDiv(
        page.id,
        pages[index - 1].id,
      )
    }
  })
}
