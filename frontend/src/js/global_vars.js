
export let isEnable2FAButtonClicked = false
export let isSubmit2FAButtonClicked = false

export function toggle2FAButton() {
  isEnable2FAButtonClicked = !isEnable2FAButtonClicked;
}

export function toggle2FASubmitButton() {
  isSubmit2FAButtonClicked = !isSubmit2FAButtonClicked;
}

