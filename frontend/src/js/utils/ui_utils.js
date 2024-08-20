
export async function loadComponent(path) {
  try {
    const response = await fetch(`/static/${path}`)
    const html = await response.text()
    document.body.innerHTML = html;

  } catch (error) {
    console.error(`Error loading ${path}:`, error)
  }
}

export function addEventListenerTo(elementID, event, callback) {
  const element = document.getElementById(elementID)

  if (element) {
    element.addEventListener(event, (e) => {
      callback()
    });
  } else {
    console.error(`Error ${elementID} not found`)
  }
}
