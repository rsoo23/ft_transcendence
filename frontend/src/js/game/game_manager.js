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
    this.nextPlayerTurn = 2

    this.p1PowerupIndicators = document.querySelectorAll('#p1-powerup-bar .powerup-indicator')
    this.p2PowerupIndicators = document.querySelectorAll('#p2-powerup-bar .powerup-indicator')
    this.p1PowerupBar = document.getElementById('p1-powerup-bar')
    this.p2PowerupBar = document.getElementById('p2-powerup-bar')
    this.powerup_charge_num = [0, 0]
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
    if (playerTurn === undefined || playerTurn === this.nextPlayerTurn) {
      return
    }
    if (playerTurn === 1) {
      this.gameHeader.innerHTML = "Serving to Player 1"
    } else if (playerTurn === 2) {
      this.gameHeader.innerHTML = "Serving to Player 2"
    }
    this.nextPlayerTurn = playerTurn
  }

  chargePowerup(chargeNum) {
    if (chargeNum[0] === this.powerup_charge_num[0] && chargeNum[1] === this.powerup_charge_num[1]) {
      return
    }

    for (let i = 0; i < chargeNum[0]; i++) {
      this.p1PowerupIndicators[i].style.backgroundColor = 'var(--yellow-200)'
    }
    for (let i = 0; i < chargeNum[1]; i++) {
      this.p2PowerupIndicators[i].style.backgroundColor = 'var(--yellow-200)'
    }

    if (chargeNum[0] === 3) {
      this.animatePowerupBarPulse(this.p1PowerupBar)
    }
    if (chargeNum[1] === 3) {
      this.animatePowerupBarPulse(this.p2PowerupBar)
    }

    this.powerup_charge_num = chargeNum
  }

  animatePowerupBarPulse(powerupBar) {
    powerupBar.animate(
      [
        { backgroundColor: 'var(--yellow-800)' },
        { backgroundColor: 'var(--yellow-500)' },
        { backgroundColor: 'var(--yellow-800)' },
      ],
      {
        duration: 1000,
        iterations: Infinity,
        easing: 'ease-in-out'
      },
    );
  }

  activatePowerup(activatorPlayerNum, powerupActivated) {
    if (this.powerup_charge_num[0] === 0 && activatorPlayerNum === 1 && powerupActivated) {
      this.resetPowerupBar(this.p1PowerupBar, this.p1PowerupIndicators)
    }

    if (this.powerup_charge_num[1] === 0 && activatorPlayerNum === 2 && powerupActivated) {
      this.resetPowerupBar(this.p2PowerupBar, this.p2PowerupIndicators)
    }
  }

  resetPowerupBar(powerupBar, powerupIndicators) {
    const animations = powerupBar.getAnimations()
    if (animations[0]) {
      animations[0].cancel()
    }

    powerupIndicators.forEach((element) => {
      element.style.backgroundColor = 'var(--charcoal-800)'
    })
  }
}
