import { PanelSwitcher } from "./ui_utils/panelswitcher_utils.js"

export var howToPlayPageSwitcher = null
let currentPageIdx = 0

export function initHowToPlayDivs() {
  const page1 = document.getElementById('how-to-play-page-1')
  const page2 = document.getElementById('how-to-play-page-2')
  const page3 = document.getElementById('how-to-play-page-3')
  const page4 = document.getElementById('how-to-play-page-4')
  const page5 = document.getElementById('how-to-play-page-5')

  const forwardButton = document.querySelector('.forward-button')
  const backButton = document.querySelector('.back-button')

  const pages = [page1, page2, page3, page4, page5]

  howToPlayPageSwitcher = new PanelSwitcher(page1, pages)

  initButtons(pages, forwardButton, backButton)
  toggleButtonVisibility(pages.length, forwardButton, backButton)
}

// sets the new forward and back buttons divs when forward / back is clicked
function initButtons(pages, forwardButton, backButton) {
  if (currentPageIdx !== pages.length - 1) {
    forwardButton.onclick = () => {
      howToPlayPageSwitcher.setCurrentDiv(
        pages[currentPageIdx].id,
        pages[currentPageIdx + 1].id
      )
      currentPageIdx++
      initButtons(pages, forwardButton, backButton)
      toggleButtonVisibility(pages.length, forwardButton, backButton)
    }
  }

  if (currentPageIdx !== 0) {
    backButton.onclick = () => {
      howToPlayPageSwitcher.setCurrentDiv(
        pages[currentPageIdx].id,
        pages[currentPageIdx - 1].id
      )
      currentPageIdx--
      initButtons(pages, forwardButton, backButton)
      toggleButtonVisibility(pages.length, forwardButton, backButton)
    }
  }
}

// if on the first page, hide the back button; otherwise show it
// if on the last page, hide the forward button; otherwise show it
function toggleButtonVisibility(pagesLen, forwardButton, backButton) {
  if (currentPageIdx === 0) {
    backButton.style.display = 'none'
  } else {
    backButton.style.display = ''
  }

  if (currentPageIdx === pagesLen - 1) {
    forwardButton.style.display = 'none'
  } else {
    forwardButton.style.display = ''
  }
}

