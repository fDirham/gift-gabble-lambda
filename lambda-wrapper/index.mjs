import recommendLogic from "../recommend-logic/index.mjs";

export const handler = async (event) => {
  const queryParams = event.queryStringParameters;

  let statusCode = 200;
  let body = null;

  try {
    console.log("Starting recommend", { queryParams });
    const res = await recommendLogic(queryParams);

    statusCode = res.statusCode;
    body = res.body;

    console.log(res);
  } catch (err) {
    console.log("FAILED");
    console.log({ error: err });

    statusCode = 500;
    body = { error: err };
  }

  // TODO implement
  const response = {
    statusCode,
    body: JSON.stringify(body),
  };
  return response;
};
