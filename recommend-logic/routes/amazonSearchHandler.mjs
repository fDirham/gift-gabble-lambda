import { dummyAmazonSearchRes } from "../../constants/dummyAmazonSearchRes.mjs";
import { formatResponse } from "../formatResponse.mjs";
import rainforestAmazonSearch from "../logic/rainforestAmazonSearch.mjs";

export default async function amazonSearchHandler(bodyParams) {
  const { q } = bodyParams;

  // TODO: Validate

  if (bodyParams.isDummy) {
    return formatResponse(dummyAmazonSearchRes);
  }

  const asRes = await rainforestAmazonSearch({
    inList: [q],
    isDummy: false,
  });

  if (asRes.isError) {
    //TODO
  }

  return formatResponse(asRes.searchDataDict[q]);
}
