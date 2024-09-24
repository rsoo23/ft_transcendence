
export let isEnable2FAButtonClicked = false
export let isSubmit2FAButtonClicked = false

export function toggle2FAButton() {
  isEnable2FAButtonClicked = !isEnable2FAButtonClicked;
}

export function toggle2FASubmitButton() {
  isSubmit2FAButtonClicked = !isSubmit2FAButtonClicked;
}

// ui state
export let hotbarItems = {
  'play': {
    'name': 'play',
    'urlPath': '/menu/play',
    'isSelected': true,
    'color': 'teal'
  },
  'stats': {
    'name': 'stats',
    'urlPath': '/menu/stats',
    'isSelected': false,
    'color': 'yellow'
  },
  'friends': {
    'name': 'friends',
    'urlPath': '/menu/friends',
    'isSelected': false,
    'color': 'blue'
  },
  'how-to-play': {
    'name': 'how-to-play',
    'urlPath': '/menu/how-to-play',
    'isSelected': false,
    'color': 'orange'
  },
  'settings': {
    'name': 'settings',
    'urlPath': '/menu/settings',
    'isSelected': false,
    'color': 'magenta'
  }
}

export function setHotbarSelected(key, state) {
  hotbarItems[key]['isSelected'] = state
}
