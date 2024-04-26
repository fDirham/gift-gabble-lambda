import { formatErrorResponse } from "./formatResponse.mjs";
import amazonSearchHandler from "./routes/amazonSearchHandler.mjs";
import productSearchHandler from "./routes/productSearchHandler.mjs";
import recommendHandler from "./routes/recHandler.mjs";

export default async function mainAPI(bodyParams) {
  const ROUTE_DICT = {
    REC: {
      handler: () => recommendHandler(bodyParams),
    },
    PROD_SEARCH: {
      handler: () => productSearchHandler(bodyParams),
    },
    AMZN_SEARCH: {
      handler: () => amazonSearchHandler(bodyParams),
    },
  };

  const actionRoute = bodyParams.actionRoute;
  if (!actionRoute || !ROUTE_DICT[actionRoute]) {
    return formatErrorResponse("Invalid inputs", 400);
  }

  return await ROUTE_DICT[actionRoute].handler();

  return formatErrorResponse("Unhandled", 400);
}
