
export async function getRequest(url) {
  const response = await fetch(url);
  const data = await response.json();

  console.log(data);
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

  console.log(responseData);
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

  console.log(responseData);
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

  console.log('Deleted:', responseData);
  return responseData
}

