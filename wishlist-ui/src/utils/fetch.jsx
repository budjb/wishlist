export const okCheck = (response, error) => {
  if (!response.ok) {
    throw Error(`${error}: Received HTTP ${response.status}`);
  }
  return response;
};
