import { ColorSwitcher } from './color_switcher.js'

var workerUI = null

const observer = new ResizeObserver((entries) => {
  const div = entries[0].target
  workerUI.postMessage({ type: 'updateWindowSize', object: [div.offsetWidth, div.offsetHeight] })
})

// this should only be called once
export function initRenderer() {
  if (workerUI != null) {
    workerUI.terminate()
  }

  const div = document.getElementById('game-container')
  const canvas = document.getElementById('pongcanvas')
  const offscreen = canvas.transferControlToOffscreen();
  workerUI = new Worker('./static/js/game/worker_ui.js', { type: 'module' });
  workerUI.postMessage({ type: 'updateCanvas', object: offscreen }, [offscreen]);
  workerUI.postMessage({ type: 'updateWindowSize', object: [div.offsetWidth, div.offsetHeight] })
  workerUI.postMessage({ type: 'start' })

  observer.observe(div)

  const colorSwitcher = new ColorSwitcher()

  workerUI.addEventListener('message', (e) => {
    const data = e.data

    colorSwitcher.switchColor(data.player_num, data.color_idx)
  })
}

export function stopRenderer() {
  workerUI.terminate()
  observer.disconnect()
  workerUI = null
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
