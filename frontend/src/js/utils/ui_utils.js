
export async function loadComponent(path) {
  try {
    const response = await fetch(`/static/${path}`)
    const html = await response.text()
    document.body.innerHTML = html;

  } catch (error) {
    console.error(`Error loading ${path}:`, error)
  }
}

export function addEventListenerTo(element, event, callback) {
  if (element) {
    element.addEventListener(event, (e) => {
      callback()
    });
  } else {
    console.error(`Error ${element} not found`)
  }
}
