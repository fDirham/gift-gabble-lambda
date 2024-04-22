export default function validateInputs(searchParams) {
  const MAX_USER_INPUT_LENGTH = 205;
  const cappedParamsList = [
    "who",
    "why",
    "whyExtra",
    "desc",
    "budget",
    "pronouns",
  ];

  for (let i = 0; i < cappedParamsList.length; i++) {
    const currParam = cappedParamsList[i];
    const val = searchParams[currParam];
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
      return "Invalid inputs";
    }
  }

  return null;
}
