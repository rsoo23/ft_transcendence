import { GameManager } from './game_manager.js'
import { isPowerupChecked } from './game_settings.js'

const WORKER_UI_LINK = '/static/js/game/worker_ui.js'

var workerUI = new Worker(WORKER_UI_LINK, { type: 'module' });

const observer = new ResizeObserver((entries) => {
  const div = entries[0].target
  workerUI.postMessage({ type: 'updateWindowSize', object: [div.offsetWidth, div.offsetHeight] })
})

// this should only be called once
export function initRenderer() {
  const div = document.getElementById('game-container')
  const canvas = document.getElementById('pongcanvas')
  const offscreen = canvas.transferControlToOffscreen();
  workerUI.postMessage({ type: 'updateCanvas', object: offscreen }, [offscreen]);
  workerUI.postMessage({ type: 'updateWindowSize', object: [div.offsetWidth, div.offsetHeight] })
  workerUI.postMessage({ type: 'start' })

  observer.observe(div)

  const gameManager = new GameManager()

  if (!isPowerupChecked) {
    gameManager.hidePowerupBars()
  }

  workerUI.addEventListener('message', (e) => {
    const { type, payload } = e.data

    switch (type) {
      case 'color_switch':
        gameManager.switchColorIndicator(payload.player_num, payload.color_idx)
        break
      case 'charge_powerup':
        gameManager.chargePowerup(payload)
        break
      case 'activate_powerup':
        gameManager.activatePowerup(payload.activator_player_num, payload.is_powerup_activated)
        break
      case 'update_turn':
        gameManager.updateTurn(payload)
        break
    }
  })
}

export function stopRenderer() {
  workerUI.terminate()
  observer.disconnect()
  workerUI = new Worker(WORKER_UI_LINK, { type: 'module' });
}

export function updateRenderer(states) {
  workerUI.postMessage({
    type: 'updateObjectsToDraw',
    object: { states: states, accumulator: 0 },
  });
  // const currenttime = performance.now()
  // // console.log(`${currenttime} - ${prevticktime} = ${currenttime - prevticktime}`)
  // tickavg[tickcount++] = currenttime - prevticktime
  // prevticktime = currenttime
  // if (tickcount >= tickavg.length)
  //   tickcount = 0

  // // console.log('ticked')
  // if (tickcount % 10 != 0)
  //   return

  // var tmpsum = 0
  // for (const t of tickavg) {
  //   tmpsum += t
  // }
  // const tmpavg = tmpsum / tickavg.length
  // document.getElementById('debugtickrate').textContent = `tick avg = ${tmpavg}\nfps = ${1 * 1000 / tmpavg}`
  // console.log('updated fps')
}
