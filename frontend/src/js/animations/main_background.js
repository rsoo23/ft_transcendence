import { getColor, getRandomColor } from "../ui_utils/color_utils.js";
import { loadContentToTarget } from "../ui_utils/ui_utils.js";

export async function loadMainBackground() {
  await loadContentToTarget('main_background.html', 'main-background')
  generateGeometricBackground()
  // // generateArcBackground()
}

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function removeBackground() {
  const curves = document.getElementById('curves')
  // const backgroundLines = document.querySelectorAll(`.line`)
  //
  // backgroundLines.forEach(line => {
  //   // line.style.animation = `dashReversed 5s ease-in-out forwards`
  //   line.classList.toggle('reversed')
  // })

  curves.innerHTML = ''
}

export function generateGeometricBackground() {
  const curves = document.querySelector('#main-bg g')
  const innerWidth = window.innerWidth
  const innerHeight = window.innerHeight

  const step = 80
  const strokeWidth = 12

  for (let y = 0; y < innerHeight; y += step) {
    for (let x = 0; x < innerWidth; x += step) {
      const i = getRandomInt(0, 1)
      let x1 = x
      let y1 = y

      const type = getRandomInt(0, 3);
      const randomColor = getRandomColor(800)

      // Create the <path> element
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

      path.setAttribute("fill", "none");
      path.classList.add("line");
      path.classList.add(randomColor['name']);
      path.style.stroke = randomColor['hex']
      path.style.strokeWidth = strokeWidth

      switch (type) {
        case 0: // Horizontal line
          path.setAttribute("d", `M ${x1} ${y1} L ${x1 + step} ${y1}`);
          break;
        case 1: // Vertical line
          path.setAttribute("d", `M ${x1} ${y1} L ${x1} ${y1 + step}`);
          break;
        case 2: // Diagonal line
          if (i === 0) {
            path.setAttribute("d", `M ${x1} ${y1} L ${x1 + step} ${y1 + step}`);
          } else {
            path.setAttribute("d", `M ${x1 + step} ${y1} L ${x1} ${y1 + step}`);
          }
          break;
      }
      curves.style.backgroundColor = curves.appendChild(path)
    }
  }
}

export function generateArcBackground() {
  const curves = document.querySelector('#main-bg g')
  const innerWidth = window.innerWidth
  const innerHeight = window.innerHeight
  const step = 175
  const strokeWidth = 12

  for (let y = 0; y < innerHeight; y += step) {
    for (let x = 0; x < innerWidth; x += step) {
      const i = getRandomInt(0, 1)
      let x1 = x
      let y1 = y

      const randomColor = getRandomColor(800)

      // Create the <path> element
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

      path.setAttribute("fill", "none");
      path.classList.add("line");
      path.classList.add(randomColor['name']);
      path.style.stroke = randomColor['hex']
      path.style.strokeWidth = strokeWidth

      const sweepFlag = getRandomInt(0, 1);
      if (i === 0) {
        // top left to bottom right
        path.setAttribute("d", `M ${x1} ${y1} A ${step} ${step} 0 0 ${sweepFlag} ${x1 + step} ${y1 + step}`);
      } else {
        // top right to bottom left
        path.setAttribute("d", `M ${x1 + step} ${y1} A ${step} ${step} 0 0 ${sweepFlag} ${x1} ${y1 + step}`);
      }

      curves.style.backgroundColor = curves.appendChild(path)
    }
  }
}

export function setBackgroundLinesColor(colorName, weight) {
  const backgroundLines = document.querySelectorAll(`.line.${colorName}`)
  const colorHex = getColor(colorName, weight)

  backgroundLines.forEach(line => {
    line.style.stroke = colorHex
  })
}

