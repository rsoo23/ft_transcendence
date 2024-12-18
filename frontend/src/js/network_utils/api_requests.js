import { getAccessToken } from "./token_utils.js"

export async function getRequest(url, outputType = 'json') {
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${getAccessToken()}`,
    },
  });
  let data

  if (outputType === 'text') {
    data = await response.text()
  } else if (outputType === 'json') {
    data = await response.json();
  } else if (outputType === 'blob') {
    data = await response.blob();
  } else {
    throw new Error('Invalid outputType. Please use "json" or "text".');
  }

  return data
}

export async function postRequest(url, data) {
  let response
  if (url === '/api/token/') {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(data)
    });
  } else if (url === '/api/upload_avatar_image/') {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: data
    });
  }
  else {
    response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(data)
    });
  }

  const responseData = await response.json();

  return responseData
}

export async function putRequest(url, data) {
  const response = await fetch(url, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  const responseData = await response.json();

  return responseData;
}

export async function deleteData(url) {
  const response = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
  });
  const responseData = await response.json();

  return responseData
}

