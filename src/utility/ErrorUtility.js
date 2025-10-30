export const fetchAndLogGeneralErrorMsg = (error, defaultMsg) => {
  if (error.response) {
    console.log(
      `Error code: ${error.response.status}, Error: ${JSON.stringify(
        error.response.data
      )}`
    );
  } else {
    console.log("Error message: ", JSON.stringify(error.message));
  }
  return defaultMsg;
};

export const logGeneralErrorMsg = (error) => {
  if (error.response) {
    console.log(
      `Error code: ${error.response.status}, Error: ${JSON.stringify(
        error.response.data
      )}`
    );
  } else {
    console.log("Error message: ", JSON.stringify(error.message));
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
      console.log(
        `Error code: ${error.response.status}, Error: ${apiResponseErrorMsg}`
      );
    } else {
      console.log(
        `Error code: ${error.response.status}, Error: ${JSON.stringify(
          error.response.data
        )}`
      );
    }
  } else {
    console.log("Error message: ", JSON.stringify(error.message));
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
    if (error.response.data?.error?.message?.length > 0) {
      const apiResponseErrorMsg = error.response.data.error.message[0];
      if (msgPrefix) {
        errorMsg = `${msgPrefix} Error: ${apiResponseErrorMsg}`;
      } else {
        errorMsg = apiResponseErrorMsg;
      }
      console.log(
        `Error code: ${error.response.status}, Error: ${apiResponseErrorMsg}`
      );
    } else {
      console.log(
        `Error code: ${error.response.status}, Error: ${JSON.stringify(
          error.response.data
        )}`
      );
    }
  } else {
    console.log("Error message: ", JSON.stringify(error.message));
  }
  return errorMsg;
};

export const fetchAndLogApiResponseErrorListObjectMsg = (
  error,
  defaultMsg,
  msgPrefix = null
) => {
  let errorMsg = defaultMsg;
  if (error.response) {
    if (
      error.response.data?.error?.length > 0 &&
      error.response.data.error[0]?.error
    ) {
      const apiResponseErrorMsg = error.response.data.error[0].error;
      if (msgPrefix) {
        errorMsg = `${msgPrefix} Error: ${apiResponseErrorMsg}`;
      } else {
        errorMsg = apiResponseErrorMsg;
      }
      console.log(
        `Error code: ${error.response.status}, Error: ${apiResponseErrorMsg}`
      );
    } else {
      console.log(
        `Error code: ${error.response.status}, Error: ${JSON.stringify(
          error.response.data
        )}`
      );
    }
  } else {
    console.log("Error message: ", JSON.stringify(error.message));
  }
  return errorMsg;
};
