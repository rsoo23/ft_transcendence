// import { PONG_INPUTS } from "../global_vars.js"
import { getColor } from "../ui_utils/color_utils.js"

export class ColorSwitcher {
  constructor() {
    this.colors = ['teal', 'magenta', 'orange', 'blue', 'yellow', 'chilled-gray']
    this.p1ColorIndicators = document.querySelectorAll('#p1-color-switcher div')
    this.p2ColorIndicators = document.querySelectorAll('#p2-color-switcher div')

    this.p1PrevColorIndex = 0
    this.p2PrevColorIndex = 0

    this.p1ColorIndex = 0
    this.p2ColorIndex = 0
  }

  switchColor(player, colorIndex) {
    if (player === undefined || colorIndex === undefined) {
      return
    }
    let prevColorIndex = player === 1 ? this.p1PrevColorIndex : this.p2PrevColorIndex

    if (colorIndex !== prevColorIndex) {
      let colorIndicators = player === 1 ? this.p1ColorIndicators : this.p2ColorIndicators

      colorIndicators[prevColorIndex].style.backgroundColor = getColor(this.colors[prevColorIndex], 800)
      colorIndicators[colorIndex].style.backgroundColor = getColor(this.colors[colorIndex], 500)

      if (player === 1) {
        this.p1PrevColorIndex = colorIndex
      } else if (player === 2) {
        this.p2PrevColorIndex = colorIndex
      }
    }
  }
}
