// Web Worker for UI stuff
// DO NOT LOAD THIS SCRIPT DIRECTLY
import { Pos2D, RenderInfo } from './rendering.js'

var tickavg = Array(100);
var tickcount = 0;

var renderInfo = null;
var loop = null;
var lastTime = performance.now();
let fontFace = new FontFace(
  'Plus Jakarta Sans',
  'url(https://fonts.gstatic.com/s/plusjakartasans/v8/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko20yw.woff2) format("woff2")',
  {
    style: 'normal',
    weight: '400',
    stretch: 'normal',
  }
);
fontFace.load().then(() => self.fonts.add(fontFace));

function renderLoop() {
  loop = requestAnimationFrame(() => renderLoop());
  const timestamp = performance.now();
  const deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  tickavg[tickcount++] = deltaTime;
  if (tickcount >= tickavg.length)
    tickcount = 0;

  if (tickcount % 10 == 0) {
    var tmpsum = 0;
    for (const t of tickavg) {
      tmpsum += t;
    }
    const tmpavg = tmpsum / tickavg.length;
    postMessage(`render avg = ${tmpavg}\nrender fps = ${1 * 1000 / tmpavg}`);
  }

  renderInfo.drawLoop(deltaTime);
}

// All messages have the following structure:
// {
//     type: <name>,
//     object: <obj>
// }
// if "object" is listed as N/A, then you can omit the "object" variable in the message structure
// do note that all types are case sensitive; if a message is not valid, it will be reported in the console

// In regards to adding a new type:
// If you add a new type, please add a comment listing out the info of the type like the others have
// Also, ensure that the type only uses one object
// You can use an array or anything you want, just make sure it goes into the "object" variable
onmessage = (e) => {
  switch (e.data.type) {
    // Type: updateCanvas
    // Object: OffscreenCanvas
    // Notes: will also initialise renderInfo if not initialised
    case 'updateCanvas':
      if (renderInfo == null) {
        renderInfo = new RenderInfo(e.data.object);
        break;
      }

      renderInfo.context = e.data.object.getContext('2d');
      break;

    // === you must send the previous types first before sending the following types ===

    // Type: updateGameSize
    // Object: Array of 2; e.g: [x, y]
    // Notes:
    // - this is an array to prevent creating a bunch of Pos2Ds (probably doesn't affect much)
    // - if this is a big problem/inconsistency, feel free to change this to accept a Pos2D object
    case 'updateWindowSize':
      if (renderInfo == null) {
        console.error('Worker-UI not properly initialized. Please send updateCanvas type first');
        return;
      }

      renderInfo.windowSize = new Pos2D(e.data.object[0], e.data.object[1]);
      renderInfo.updateScaling();
      break;

    // Type: updateObjectsToDraw
    // Object: Array with ObjectState items and the current accumulator value
    // Structure: {states: <array>, accumulator: <float>}
    // Notes: this should only be called from the mainLoop (ideally)
    case 'updateObjectsToDraw':
      renderInfo.objectsToDraw = e.data.object['states'];
      renderInfo.accumulator = e.data.object['accumulator'];
      break;

    // Type: updateScore
    // Object: Array of 2 ints; e.g: [x, y]
    // Notes: this should only be called from the mainLoop (ideally)
    case 'updateScore':
      renderInfo.gameScore = e.data.object;
      break;

    // Type: start
    // Object: N/A
    // Notes: ensure everything is properly set up before running this
    case 'start':
      if (renderInfo == null) {
        console.error('Worker-UI not properly initialized. Please send updateGameInfo and updateCanvas types first');
        return;
      }

      renderLoop();
      break;

    // Type: start
    // Object: N/A
    // Notes: ensure everything is properly set up before running this
    case 'stop':
      if (loop == null) {
        console.error('No render loop running.');
        return;
      }

      cancelAnimationFrame(loop);
      break;

    default:
      console.error('invalid type sent to Worker-UI');
      break;
  }
}
