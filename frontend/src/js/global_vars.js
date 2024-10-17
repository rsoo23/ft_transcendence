
export const ANIM_WAIT_DURATION = 550

export const MAX_AVATAR_FILE_SIZE = 2000000

export let userInfo = {}

export function setUserInfo(obj) {
  userInfo = obj
}

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

export let friendRecordIconInfo = {
  'added': [
    {
      'icon-id': 'challenge-icon',
      'icon-name': 'play_circle',
      'tooltip-id': 'challenge-tooltip',
      'tooltip-text': 'Challenge',
    },
    {
      'icon-id': 'chat-icon',
      'icon-name': 'chat',
      'tooltip-id': 'chat-tooltip',
      'tooltip-text': 'Chat',
    },
    {
      'icon-id': 'block-icon',
      'icon-name': 'block',
      'tooltip-id': 'block-tooltip',
      'tooltip-text': 'Block',
    },
  ],
  'blocked': [
    {
      'icon-id': 'unblock-icon',
      'icon-name': 'lock_reset',
      'tooltip-id': 'unblock-tooltip',
      'tooltip-text': 'Unblock',
    }
  ],
  'sent-friend-request': [
    {
      'icon-id': 'cancel-icon',
      'icon-name': 'close',
      'tooltip-id': 'cancel-tooltip',
      'tooltip-text': 'Cancel',
    },
  ],
  'received-friend-request': [
    {
      'icon-id': 'decline-icon',
      'icon-name': 'close',
      'tooltip-id': 'decline-tooltip',
      'tooltip-text': 'Decline',
    },
    {
      'icon-id': 'accept-icon',
      'icon-name': 'check',
      'tooltip-id': 'accept-tooltip',
      'tooltip-text': 'Accept',
    },
  ],
  'not-added': [
    {
      'icon-id': 'send-friend-request-icon',
      'icon-name': 'person_add',
      'tooltip-id': 'send-friend-request--tooltip',
      'tooltip-text': 'Send friend request',
    },
  ],
}

