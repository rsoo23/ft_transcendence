import { addEventListenerTo } from "./ui_utils.js";

export function initLink(linkID, callback) {
  const link = document.getElementById(linkID)

  addEventListenerTo(
    link,
    'click',
    () => {
      callback();
    }
  )
}

