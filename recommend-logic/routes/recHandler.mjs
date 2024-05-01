import { dummyRecRes } from "../../constants/dummyRecRes.mjs";
import { formatErrorResponse, formatResponse } from "../formatResponse.mjs";
import googleProgAmazonImageSearch from "../logic/googleProgAmazonImageSearch.mjs";
import oaiRecommend from "../logic/oaiRecommend.mjs";

export default async function recommendHandler(bodyParams) {
  const { formResponse, oldIdeaList } = bodyParams;

  // Validate inputs
  // TODO: Validate old idea list and better validation overall
  if (!validateFormResponse(formResponse)) {
    return formatErrorResponse("Invalid form response", 400);
  }

  if (bodyParams.isDummy) {
    return formatResponse(dummyRecRes);
  }

  const MAX_REC_LENGTH = 10;
  const recRes = await oaiRecommend({
    formResponse,
    isDummy: false, // TODO
    size: MAX_REC_LENGTH,
    oldIdeaList,
  });

  if (recRes.isError) {
    return formatErrorResponse(recRes.errorObj, recRes.statusCode);
  }

  const { ideaList } = recRes;

  let inList = ideaList;
  const MAX_PS_IN_LENGTH = 10;
  if (inList.length > MAX_PS_IN_LENGTH) {
    inList = inList.slice(0, MAX_PS_IN_LENGTH);
  }

  const psRes = await googleProgAmazonImageSearch({
    inList,
    isDummy: false, // TODO
  });

  if (psRes.isError) {
    // TODO
  }

  const { productDataDict } = psRes;

  const toReturn = [];
  const MIN_PRODUCT_LIST_SIZE = 3;
  ideaList.forEach((idea) => {
    const productList = productDataDict[idea];
    if (productList && productList.length >= MIN_PRODUCT_LIST_SIZE) {
      toReturn.push({ idea, productList });
    }
  });

  return formatResponse(toReturn);
}

function validateFormResponse(formResponse) {
  if (!formResponse) return false;

  const cappedParamsList = [
    "who",
    "why",
    "whyExtra",
    "desc",
    "budget",
    "pronouns",
    "giftNotes",
  ];

  for (let i = 0; i < cappedParamsList.length; i++) {
    const currParam = cappedParamsList[i];
    const val = formResponse[currParam];
    if (!val) continue;

    let isValid = true;
    if (currParam == "budget") {
      try {
        parseFloat(val);
      } catch {
        isValid = false;
      }
    }

    const MAX_USER_INPUT_LENGTH = 200;
    if (val.length > MAX_USER_INPUT_LENGTH) {
      isValid = false;
    }

    if (!isValid) {
      return false;
    }
  }

  return true;
}
