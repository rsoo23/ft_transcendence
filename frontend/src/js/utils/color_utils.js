
const colors = ['teal', 'magenta', 'orange', 'blue', 'yellow', 'chilled-gray']
const validWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900]

// returns a random hex value based on the colors array and color variables set in root
export function getRandomColor(weight) {
  const randomIndex = Math.floor(Math.random() * (colors.length - 1))
  const colorName = colors[randomIndex]

  if (validWeights.includes(weight)) {
    const colorVarName = `--${colorName}-${weight.toString()}`
    const colorHexVal = getComputedStyle(document.documentElement).getPropertyValue(colorVarName)

    // console.log("Selected random color: ", colorVarName, ' ', colorHexVal)
    return {
      hex: colorHexVal,
      name: colorName
    }
  } else {
    console.error("Error in getRandomColor(): Invalid weight")
    return
  }
}

export function getColor(colorName, weight) {
  let colorVarName = ""

  if (validWeights.includes(weight)) {
    colorVarName = `--${colorName}-${weight.toString()}`
    const colorHexVal = getComputedStyle(document.documentElement).getPropertyValue(colorVarName)

    // console.log("Selected random color: ", colorVarName, ' ', colorHexVal)
    return colorHexVal
  } else {
    console.error("Error in getColor(): Invalid color ", colorVarName)
    return
  }
}

