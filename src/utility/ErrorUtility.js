export const fetchAndLogGeneralErrorMsg = (error, defaultMsg) => {
  if (error.response) {
    console.log(
      `Error code: ${error.response.status}, Error: ${error.response.data}`
    );
  } else {
    console.log("Error message: ", error.message);
  }
  return defaultMsg;
};

export const logGeneralErrorMsg = (error) => {
  if (error.response) {
    console.log(
      `Error code: ${error.response.status}, Error: ${error.response.data}`
    );
  } else {
    console.log("Error message: ", error.message);
  }
};

export const fetchAndLogApiResponseErrorMsg = (
  error,
  apiResponseErrorMsg,
  defaultMsg,
  msgPrefix = null
) => {
  let errorMsg = defaultMsg;
  if (error.response) {
    if (apiResponseErrorMsg) {
      if (msgPrefix) {
        errorMsg = `${msgPrefix} Error: ${apiResponseErrorMsg}`;
      } else {
        errorMsg = apiResponseErrorMsg;
      }
      console.log(`Error code: ${error.response.status}, Error: ${errorMsg}`);
    } else {
      console.log(
        `Error code: ${error.response.status}, Error: ${error.response.data}`
      );
    }
  } else {
    console.log("Error message: ", error.message);
  }
  return errorMsg;
};

export const fetchAndLogApiResponseErrorListMsg = (
  error,
  defaultMsg,
  msgPrefix = null
) => {
  let errorMsg = defaultMsg;
  if (error.response) {
    if (error.response.data?.errors?.message?.length > 0) {
      if (msgPrefix) {
        errorMsg = `${msgPrefix} Error: ${error.response.data.errors.message[0]}`;
      } else {
        errorMsg = error.response.data.errors.message[0];
      }
      console.log(`Error code: ${error.response.status}, Error: ${errorMsg}`);
    } else {
      console.log(
        `Error code: ${error.response.status}, Error: ${error.response.data}`
      );
    }
  } else {
    console.log("Error message: ", error.message);
  }
  return errorMsg;
};
