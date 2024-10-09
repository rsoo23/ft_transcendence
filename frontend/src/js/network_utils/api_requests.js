
export let accessToken = ''

export function setAccessToken(token) {
  accessToken = token
}

export async function getRequest(url, outputType = 'json') {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    }
  });
  let data

  if (outputType === 'text') {
    data = await response.text()
  } else if (outputType === 'json') {
    data = await response.json();
  } else {
    throw new Error('Invalid outputType. Please use "json" or "text".');
  }
  // console.log(data);
  return data
}

export async function postRequest(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  const responseData = await response.json();

  // console.log(responseData);
  return responseData
}

export async function putRequest(url, data) {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  const responseData = await response.json();

  // console.log(responseData);
  return responseData;
}

export async function deleteData(url) {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  });
  const responseData = await response.json();

  // console.log('Deleted:', responseData);
  return responseData
}

