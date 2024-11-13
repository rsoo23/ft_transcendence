// import { PONG_INPUTS } from "../global_vars.js"
import { getColor } from "../ui_utils/color_utils.js"

export class GameManager {
  constructor() {
    this.colors = ['teal', 'magenta', 'orange', 'blue', 'yellow', 'chilled-gray']
    this.p1ColorIndicators = document.querySelectorAll('#p1-color-switcher div')
    this.p2ColorIndicators = document.querySelectorAll('#p2-color-switcher div')

    this.p1PrevColorIndex = 0
    this.p2PrevColorIndex = 0

    this.p1ColorIndex = 0
    this.p2ColorIndex = 0

    this.gameHeader = document.getElementById('game-header-text')
  }

  switchColorIndicator(playerNum, colorIndex) {
    if (playerNum === undefined || colorIndex === undefined) {
      return
    }
    let prevColorIndex = playerNum === 1 ? this.p1PrevColorIndex : this.p2PrevColorIndex

    if (colorIndex !== prevColorIndex) {
      let colorIndicators = playerNum === 1 ? this.p1ColorIndicators : this.p2ColorIndicators

      colorIndicators[prevColorIndex].style.backgroundColor = getColor(this.colors[prevColorIndex], 800)
      colorIndicators[colorIndex].style.backgroundColor = getColor(this.colors[colorIndex], 500)

      if (playerNum === 1) {
        this.p1PrevColorIndex = colorIndex
      } else if (playerNum === 2) {
        this.p2PrevColorIndex = colorIndex
      }
    }
  }

  updateTurn(playerTurn) {
    if (playerTurn === undefined) {
      return
    }
    if (playerTurn === 1) {
      this.gameHeader.innerHTML = "Serving to Player 1"
    } else if (playerTurn === 2) {
      this.gameHeader.innerHTML = "Serving to Player 2"
    }
  }
}
