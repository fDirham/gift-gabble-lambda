import { dummyAmazonSearchRes } from "../../constants/dummyAmazonSearchRes.mjs";
import { formatResponse } from "../formatResponse.mjs";
import oxylabsAmazonProductSearch from "../logic/oxylabsAmazonProductSearch.mjs";
export default async function oxylabsAmazonProdSearchHandler(bodyParams) {
  const { inList } = bodyParams;

  // TODO: Validate
  if (bodyParams.isDummy) {
    return formatResponse(dummyAmazonSearchRes);
  }

  const asRes = await oxylabsAmazonProductSearch({
    inList,
    isDummy: false,
  });

  if (asRes.isError) {
    //TODO
  }

  return formatResponse(asRes.productDataDict);
}
