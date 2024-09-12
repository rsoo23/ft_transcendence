
export function setDefaultAvatar() {
  const avatar = document.querySelector('#user-profile-panel .avatar')

  avatar.src = '/static/images/kirby.png'
}

export async function changeAvatar() {
  const avatar = document.querySelector('#user-profile-panel .avatar')
  const imgUploadInput = document.querySelector('#user-profile-panel .img-upload-input')

  imgUploadInput.click()
}

export function initFileInput() {
  const imgUploadInput = document.querySelector('#user-profile-panel .img-upload-input')
  const avatar = document.querySelector('#user-profile-panel .avatar')

  imgUploadInput.addEventListener('change', function () {
    const image = this.files[0]
    const reader = new FileReader()
    reader.onload = () => {
      const imgUrl = reader.result
      avatar.src = imgUrl
    }
    reader.readAsDataURL(image)
  })
}
