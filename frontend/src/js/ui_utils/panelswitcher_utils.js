export class PanelSwitcher {
  // listOfDivs should be in the order that you plan to have the panel appear in
  // scrolling depends on the order of the divs in the array
  constructor(mainDiv, listOfDivs) {
    this.divBacklog = listOfDivs

    // move all the divs to be at the same position as the mainDiv
    // set to null or undefined if you don't want to do this
    if (!mainDiv) {
      return
    }

    const moveAToB = (e1, e2) => {
      const e1Rect = e1.getBoundingClientRect()
      const e2Rect = e2.getBoundingClientRect()
      e1.style.top = `-${e1Rect.top - e2Rect.top}px`
    }
    for (const div of listOfDivs) {
      div.style.setProperty('position', 'relative')
      moveAToB(div, mainDiv)
    }

    this.setCurrentDiv(mainDiv.id, mainDiv.id, true)
  }

  disableDivInput(id) {
    const div = document.getElementById(id)
    div.style.setProperty('pointer-events', 'none', 'important')
    let buttons = div.querySelectorAll('button')
    buttons.forEach((b) => b.disabled = true)
  }

  setCurrentDiv(fromDivId, toDivId, instant=false) {
    const divToMoveFrom = document.getElementById(fromDivId)
    const divToMoveTo = document.getElementById(toDivId)
    if (!divToMoveFrom || !divToMoveTo) {
      console.trace()
      console.error('setCurrentDiv: Invalid div ID provided')
      return
    }

    if (!this.divBacklog.includes(divToMoveFrom) || !this.divBacklog.includes(divToMoveTo)) {
      console.trace()
      console.error('setCurrentDiv: Provided div ID could not be found in divBacklog')
      return
    }

    let pastDivToMoveTo = false
    for (const element of this.divBacklog) {
      // skip transition if not in view, or if set to be instant
      if ((element == divToMoveFrom || element == divToMoveTo) && !instant) {
        element.style.transition = ''
      } else {
        element.style.setProperty('transition', 'none')
      }

      let buttons = element.querySelectorAll('button')
      if (element != divToMoveTo && !pastDivToMoveTo) {
        element.style.setProperty('left', '-100rem')
        element.style.setProperty('opacity', '0')
        element.style.setProperty('visibility', 'hidden', 'important')
        element.style.setProperty('pointer-events', 'none', 'important')
        buttons.forEach((b) => b.disabled = true)
      } else if (element == divToMoveTo) {
        element.style.setProperty('left', '0')
        element.style.setProperty('opacity', '1')
        element.style.setProperty('visibility', 'visible', 'important')
        element.style.setProperty('pointer-events', 'auto', 'important')
        buttons.forEach((b) => b.disabled = false)
      } else {
        element.style.setProperty('left', '100rem')
        element.style.setProperty('opacity', '0')
        element.style.setProperty('visibility', 'hidden', 'important')
        element.style.setProperty('pointer-events', 'none', 'important')
        buttons.forEach((b) => b.disabled = true)
      }

      if (element == divToMoveTo) {
        pastDivToMoveTo = true
      }
    }
  }
}
