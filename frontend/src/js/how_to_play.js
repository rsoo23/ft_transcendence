import { PanelSwitcher } from "./ui_utils/panelswitcher_utils.js"

export var howToPlayPageSwitcher = null

export function initHowToPlayDivs() {
  const page1 = document.getElementById('how-to-play-page-1')
  const page2 = document.getElementById('how-to-play-page-2')

  howToPlayPageSwitcher = new PanelSwitcher(page1, [page1, page2])
  document.getElementById('page-1-forward-button').onclick = () => howToPlayPageSwitcher.setCurrentDiv(
    'how-to-play-page-1',
    'how-to-play-page-2',
  )
  document.getElementById('page-2-back-button').onclick = () => howToPlayPageSwitcher.setCurrentDiv(
    'how-to-play-page-2',
    'how-to-play-page-1',
  )
}
