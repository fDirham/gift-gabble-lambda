import { formatResponse } from "../formatResponse.mjs";
import rainforestAmazonSearch from "../logic/rainforestAmazonSearch.mjs";

export default async function amazonSearchHandler(bodyParams) {
  // TODO: Validate

  let { q } = bodyParams;

  const asRes = await rainforestAmazonSearch({
    inList: [q],
    isDummy: false,
  });

  if (asRes.isError) {
    //TODO
  }

  return formatResponse(asRes.searchDataDict);
}
