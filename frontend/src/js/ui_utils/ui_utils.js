import { getRequest } from "../network_utils/api_requests.js";

export async function addEventListenerTo(element, event, callback) {
  if (element) {
    element.addEventListener(event, (e) => {
      e.preventDefault()
      callback()
    });
  } else {
    console.error(`Error ${element} not found`)
  }
}

export async function loadContentToTarget(path, elementId) {
  try {
    const html = await getRequest(`/static/components/${path}`, 'text')

    document.getElementById(elementId).innerHTML = html;
  } catch (error) {
    console.error(`Error loading static/components/${path}:`, error)
  }
}

export function addTextPlaceholder(elementId, text) {
  const element = document.getElementById(elementId)
  const textContainer = document.createElement('div');

  textContainer.textContent = text
  element.appendChild(textContainer)
  element.style.justifyContent = 'center'
  element.style.alignItems = 'center'
}

export function truncateString(string, maxLength) {
  if (string.length > maxLength) {
    return string.slice(0, maxLength) + '..'
  }
  return string
}
