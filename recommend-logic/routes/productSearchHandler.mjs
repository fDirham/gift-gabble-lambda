import { formatResponse } from "../formatResponse.mjs";
import googleProgProductSearch from "../logic/googleProgProductSearch.mjs";

export default async function productSearchHandler(bodyParams) {
  let { inList } = bodyParams;
  // TODO: Validate inputs

  const MAX_PS_IN_LENGTH = 6;
  if (inList.length > MAX_PS_IN_LENGTH) {
    inList = inList.slice(0, MAX_PS_IN_LENGTH);
  }

  const psRes = await googleProgProductSearch({
    inList: inList,
    isDummy: false, // TODO
  });

  if (psRes.isError) {
    // TODO
  }

  const { productDataDict } = psRes;

  return formatResponse(productDataDict);
}
