import { DUMMY_OXYLABS_AMAZON_PROD_SEARCH_RES } from "../../constants/dummyOxylabsAmazonProdSearchRes.mjs";
import { formatResponse } from "../formatResponse.mjs";
import oxylabsAmazonProductSearch from "../logic/oxylabsAmazonProductSearch.mjs";
export default async function oxylabsAmazonProdSearchHandler(bodyParams) {
  const { inList } = bodyParams;

  // TODO: Validate
  if (bodyParams.isDummy) {
    return formatResponse(DUMMY_OXYLABS_AMAZON_PROD_SEARCH_RES);
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
