import { formatErrorResponse, formatResponse } from "../formatResponse.mjs";
import googleProgProductSearch from "../logic/googleProgProductSearch.mjs";
import oaiRecommend from "../logic/oaiRecommend.mjs";

export default async function recommendHandler(bodyParams) {
  const { formResponse, oldIdeaList } = bodyParams;
  // Validate inputs
  if (!validateFormResponse(formResponse)) {
    return formatErrorResponse("Invalid form response", 400);
  }

  // TODO: Validate old idea list and better validation overall

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
  const MAX_PS_IN_LENGTH = 6;
  if (inList.length > MAX_PS_IN_LENGTH) {
    inList = inList.slice(0, MAX_PS_IN_LENGTH);
  }

  const psRes = await googleProgProductSearch({
    inList,
    isDummy: false, // TODO
  });

  if (psRes.isError) {
    // TODO
  }

  const { productDataDict } = psRes;

  const toReturn = ideaList.map((idea) => {
    if (!productDataDict[idea]) return { idea };
    return { idea, productList: productDataDict[idea] };
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
