
export async function addEventListenerTo(element, event, callback) {
  if (element) {
    element.addEventListener(event, (e) => {
      callback()
    });
  } else {
    console.error(`Error ${element} not found`)
  }
}
