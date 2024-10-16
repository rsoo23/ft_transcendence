import { addEventListenerTo } from "./ui_utils/ui_utils.js"
import { MAX_AVATAR_FILE_SIZE, userInfo } from "./global_vars.js"
import { postRequest } from "./network_utils/api_requests.js"

export function initEditIcons() {
  const editAvatarIcon = document.querySelector('.profile-settings-icon.edit-avatar-icon')

  addEventListenerTo(
    editAvatarIcon,
    'click',
    () => {
      changeAvatar()
    }
  )
}

let imageToUpload

export function setDefaultAvatar() {
  const avatar = document.querySelector('#profile-settings-container .profile-settings-avatar')

  avatar.src = '/static/images/kirby.png'
}

export async function changeAvatar() {
  // const imgUploadInput = document.querySelector('#avatar-upload-panel .img-upload-input')
  const imgUploadInput = document.querySelector('.edit-avatar-input')

  imgUploadInput.click()
}

export function initFileInput() {
  // const imgUploadInput = document.querySelector('#avatar-upload-panel .img-upload-input')
  // const avatar = document.querySelector('#avatar-upload-panel .avatar')

  const imgUploadInput = document.querySelector('#profile-settings-container .edit-avatar-input')
  const avatar = document.querySelector('#profile-settings-container .profile-settings-avatar')

  imgUploadInput.addEventListener('change', function () {
    const image = this.files[0]

    if (image.size > MAX_AVATAR_FILE_SIZE) {
      alert("Image size more than 10MB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const imgUrl = reader.result
      avatar.src = imgUrl
    }
    reader.readAsDataURL(image)
    imageToUpload = image
  })
}

export async function uploadAvatarImage() {
  try {
    const formData = new FormData()
    formData.append('avatar_img', imageToUpload)
    formData.append('username', userInfo['username'])
    const response = await postRequest('/api/upload_avatar_image/', formData)

    if (response.ok) {
      return 'success'
    } else {
      alert('Error uploading image to server')
      return 'failure'
    }
  } catch (error) {
    console.error('Error uploading image: ', error)
  }
}
