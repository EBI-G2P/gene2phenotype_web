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

// This function expects API error response format as:
// {
// 	"error": "msg"
// }
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

// This function expects API error response format as:
// {
// 	"error": ["msg"]
// }
export const fetchAndLogApiResponseErrorListMsg = (
  error,
  apiResponseErrorList,
  defaultMsg,
  msgPrefix = null
) => {
  let errorMsg = defaultMsg;
  if (error.response) {
    if (apiResponseErrorList?.length > 0) {
      const apiResponseErrorMsg = apiResponseErrorList[0];
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

// This function expects API error response format as:
// {
// 	"error": [
// 		{
// 			"error": "msg",
//      ...
// 		}
// 	]
// }
export const fetchAndLogApiResponseErrorListObjectMsg = (
  error,
  apiResponseErrorList,
  defaultMsg,
  msgPrefix = null
) => {
  let errorMsg = defaultMsg;
  if (error.response) {
    if (apiResponseErrorList?.length > 0 && apiResponseErrorList[0]?.error) {
      const apiResponseErrorMsg = apiResponseErrorList[0].error;
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
