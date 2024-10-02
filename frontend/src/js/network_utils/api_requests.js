
export async function getRequest(url, outputType = 'json') {
  const response = await fetch(url);
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
      'Content-Type': 'application/json',
    }
  });
  const responseData = await response.json();

  // console.log('Deleted:', responseData);
  return responseData
}

