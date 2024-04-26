import ACTION_TYPE_DICT from "./actionRoutes/_actionRouteDict.mjs";

export default function validateInputs(bodyParams) {
  const MAX_USER_INPUT_LENGTH = 205;

  const { formResponse, actionType, retrieveImageList, inList } = bodyParams;

  // Check action type
  if (!actionType || !ACTION_TYPE_DICT[actionType]) {
    return false;
  }

  if (actionType == ACTION_TYPE_DICT.REC) {
    if (!formResponse) return false;
  }

  if (actionType == ACTION_TYPE_DICT.IMG) {
    if (!retrieveImageList) return false;
  }

  if (actionType == ACTION_TYPE_DICT.PS_GOOGLE) {
    if (!inList) return false;
  }

  if (actionType == ACTION_TYPE_DICT.PS_RAINFOREST) {
    if (!inList) return false;
  }

  // Check form response
  if (formResponse) {
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

      if (val.length > MAX_USER_INPUT_LENGTH) {
        isValid = false;
      }

      if (!isValid) {
        return false;
      }
    }
  }

  return true;
}
