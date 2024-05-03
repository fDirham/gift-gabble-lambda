import { formatErrorResponse, formatResponse } from "../formatResponse.mjs";
import oaiRecommend from "../logic/oaiRecommend.mjs";
import { DUMMY_REC_RES } from "../../constants/dummyRecRes.mjs";

export default async function recommendHandler(bodyParams) {
  const { formResponse, oldIdeaList } = bodyParams;

  // Validate inputs
  // TODO: Validate old idea list and better validation overall
  if (!validateFormResponse(formResponse)) {
    return formatErrorResponse("Invalid form response", 400);
  }

  if (bodyParams.isDummy) {
    return formatResponse(DUMMY_REC_RES);
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

  return formatResponse(ideaList);
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
