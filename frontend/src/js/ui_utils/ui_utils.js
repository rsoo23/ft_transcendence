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

