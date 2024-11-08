// TODO: check if we still need this
export class Pos2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  // Creates a new Pos2D with the same values
  clone() {
    return new Pos2D(this.x, this.y);
  }
}

class Paddle {
  constructor() {
    this.size = new Pos2D(7, 45);
  }

  draw(renderInfo, pos, prevState, nextState) {
    renderInfo.ctx.fillStyle = nextState.info.color
    renderInfo.fillRectScaled(pos.x, pos.y, this.size.x, this.size.y);
  }
}

class Ball {
  constructor() {
    this.radius = 3.5;
  }

  draw(renderInfo, pos, prevState, nextState) {
    renderInfo.ctx.fillStyle = nextState.info.color
    renderInfo.arcScaled(pos.x + this.radius, pos.y + this.radius, this.radius, 0, 2 * Math.PI);
    renderInfo.ctx.fill();
  }
}

class Score {
  constructor() {
    this.size = 36;
    this.font = 'Plus Jakarta Sans';
  }

  draw(renderInfo, pos, prevState, nextState) {
    renderInfo.ctx.font = `${(this.size * renderInfo.windowScale.x)}px "${this.font}"`;
    renderInfo.ctx.textAlign = 'center';
    renderInfo.ctx.textBaseline = 'middle';
    renderInfo.fillTextScaled("" + nextState.info['score'], pos.x, pos.y);
    renderInfo.ctx.stroke()
  }
}

class Countdown {
  constructor() {
    this.size = 36;
    this.font = 'Plus Jakarta Sans';
  }

  draw(renderInfo, pos, prevState, nextState) {
    renderInfo.ctx.font = `${(this.size * renderInfo.windowScale.x)}px "${this.font}"`;
    renderInfo.ctx.textAlign = 'center';
    renderInfo.ctx.textBaseline = 'middle';

    const text = nextState.info['time'] === 0 ? "Start!" : "" + nextState.info['time'];
    const textWidth = renderInfo.ctx.measureText(text).width;
    const textHeight = this.size * renderInfo.windowScale.x;

    // Draw overlay rectangle
    renderInfo.ctx.fillStyle = 'rgb(0 0 0)';
    renderInfo.fillRectScaled(
      pos.x - (textWidth / 2),
      pos.y - (textHeight / 2),
      textWidth,
      textHeight
    );

    // Draw text
    renderInfo.ctx.fillStyle = 'white'; // Text color
    renderInfo.fillTextScaled(text, pos.x, pos.y);

    renderInfo.ctx.stroke()
  }
}

const STYLES = {
  'paddle': new Paddle(),
  'ball': new Ball(),
  'score': new Score(),
  'countdown_timer': new Countdown(),
}

// The main renderer, it does all the work :]
// name might be outdated, but it works ig
// TODO: separate background rendering from the foreground (because we don't have to draw the background constantly)
export class RenderInfo {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gameSize = new Pos2D(400, 240);
    this.windowSize = new Pos2D(0, 0);
    this.windowScale = new Pos2D(1.0, 1.0);
    this.windowPadding = new Pos2D(0, 0); // used to maintain 5:3 ratio

    // stuff from gameInfo
    this.gameScore = [0, 0];
    this.objectsToDraw = [];
    this.accumulator = 0;
    this.gameDeltaTime = 1 / 60; // this refers to the game logic's tickrate in ms
  }

  drawLoop(dT) {
    if (this.gameSize == null || this.windowSize == null)
      return;

    // NOTE: apparently, updating the canvas size causes the canvas to clear itself
    this.canvas.width = this.windowSize.x;
    this.canvas.height = this.windowSize.y;
    this.ctx.beginPath();
    this.ctx.strokeStyle = "white";
    this.ctx.fillStyle = "white";

    // border
    // TODO: make the linewidth scale with the screen properly
    this.ctx.save();
    this.ctx.lineWidth = 5;
    // calculations to make position account for scaling
    const halfWidth = this.ctx.lineWidth / 2;
    const halfWidthX = halfWidth / this.windowScale.x;
    const halfWidthY = halfWidth / this.windowScale.y;
    this.strokeRectScaled(
      -halfWidthX,
      -halfWidthY,
      this.gameSize.x + halfWidthX * 2,
      this.gameSize.y + halfWidthY * 2
    );
    // center line
    this.ctx.setLineDash([10, 10]);
    this.drawLineScaled(
      this.gameSize.x / 2, 0,
      this.gameSize.x / 2, this.gameSize.y
    );
    this.ctx.stroke();
    this.ctx.restore();

    // interpolation
    this.accumulator += dT;
    const alpha = Math.min(this.accumulator / this.gameDeltaTime, 1);

    for (const objInfo of this.objectsToDraw) {
      let objStates = objInfo.states
      // console.log(objStates)
      // idk why, but sometimes the objstate is null
      // if (objStates == null)
      // 	continue;

      let prevState = objStates[0];
      let nextState = null;

      let alphaAccumulator = 0;
      let totalAlpha = 0;
      for (let i = 1; i < objStates.length; i++) {
        nextState = objStates[i];
        if (nextState.alpha >= alpha)
          break;

        prevState = nextState;
        alphaAccumulator += nextState.alpha - totalAlpha;
        totalAlpha += nextState.alpha;
      }

      if (nextState == null)
        continue;

      const relativeAlpha = (alpha - alphaAccumulator) / (nextState.alpha - alphaAccumulator);
      const lerp = (x0, x1, t) => (x0 * (1 - t)) + (x1 * t);

      const debugMode = false;
      if (debugMode) {
        const finalState = objStates[objStates.length - 1];
        this.ctx.fillStyle = "yellow";
        this.fillRectScaled(nextState.pos.x, nextState.pos.y, nextState.size.x, nextState.size.y);
        this.ctx.fillStyle = "green";
        this.fillRectScaled(finalState.pos.x, finalState.pos.y, finalState.size.x, finalState.size.y);
        this.ctx.fillStyle = "white";
      }

      let interpPos = new Pos2D(0, 0);
      if (relativeAlpha < 1.0) {
        interpPos.x = lerp(prevState.pos.x, nextState.pos.x, relativeAlpha);
        interpPos.y = lerp(prevState.pos.y, nextState.pos.y, relativeAlpha);
        if (alphaAccumulator > 0 && debugMode) {
          console.log('======');
          console.log('(' + alpha + ' - ' + alphaAccumulator + ') / (' + nextState.alpha + ' - ' + alphaAccumulator + ') = ' + relativeAlpha);
          console.log('scale ' + (nextState.alpha - alphaAccumulator));
          console.log('nextstate: ' + nextState.alpha + '\nalphaAccumulator: ' + alphaAccumulator + '\nrelativeAlpha: ' + relativeAlpha);
          console.log(interpPos);
          console.log(nextState.pos);
        }
      }
      else
        interpPos = nextState.pos;

      const objStyle = STYLES[objInfo.name];
      this.ctx.save();
      this.ctx.beginPath();

      objStyle.draw(this, interpPos, prevState, nextState);

      this.ctx.closePath();
      this.ctx.restore();
    }
  }

  arcScaled(x, y, radius, startAngle, endAngle, counterclockwise = false) {
    this.ctx.arc(
      x * this.windowScale.x + this.windowPadding.x,
      y * this.windowScale.y + this.windowPadding.y,
      radius * this.windowScale.x,
      startAngle,
      endAngle,
      counterclockwise
    );
  }

  drawLineScaled(x0, y0, x1, y1) {
    this.ctx.moveTo(
      x0 * this.windowScale.x + this.windowPadding.x,
      y0 * this.windowScale.y + this.windowPadding.y
    );
    this.ctx.lineTo(
      x1 * this.windowScale.x + this.windowPadding.x,
      y1 * this.windowScale.y + this.windowPadding.y
    );
    this.ctx.moveTo(0, 0);
  }

  strokeRectScaled(x, y, width, height) {
    this.ctx.strokeRect(
      x * this.windowScale.x + this.windowPadding.x,
      y * this.windowScale.y + this.windowPadding.y,
      width * this.windowScale.x,
      height * this.windowScale.y
    );
  }

  fillRectScaled(x, y, width, height) {
    this.ctx.fillRect(
      x * this.windowScale.x + this.windowPadding.x,
      y * this.windowScale.y + this.windowPadding.y,
      width * this.windowScale.x,
      height * this.windowScale.y
    );
  }

  fillTextScaled(text, x, y) {
    this.ctx.fillText(
      text,
      x * this.windowScale.x + this.windowPadding.x,
      y * this.windowScale.y + this.windowPadding.y
    );
  }

  updateScaling() {
    if (this.windowSize.x > this.windowSize.y) {
      // this.windowPadding.y = this.windowSize.y * 0.05;
      const actualWidth = this.gameSize.x / this.gameSize.y * (this.windowSize.y - 2 * this.windowPadding.y);
      // this.windowPadding.x = (this.windowSize.x - actualWidth) / 2;
    }
    else {
      // this.windowPadding.x = this.windowSize.x * 0.05;
      const actualHeight = (this.windowSize.x - 2 * this.windowPadding.x) * this.gameSize.y / this.gameSize.x;
      // this.windowPadding.y = (this.windowSize.y - actualHeight) / 2;
    }

    this.windowScale.x = (this.windowSize.x - 2 * this.windowPadding.x) / this.gameSize.x;
    this.windowScale.y = (this.windowSize.y - 2 * this.windowPadding.y) / this.gameSize.y;
  }
}
