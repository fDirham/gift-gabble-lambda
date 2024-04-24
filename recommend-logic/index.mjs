import ACTION_TYPE_DICT from "../constants/actionTypeList.mjs";
import getAmazonSearchLinks from "./getAmazonSearchLinks.mjs";
import getImages from "./getImages.mjs";
import getRecList from "./getRecList.mjs";
import validateInputs from "./validateInputs.mjs";

export default async function recommendLogic(bodyParams) {
  const validInputs = validateInputs(bodyParams);
  if (!validInputs) {
    return { body: { error: "Invalid inputs" }, statusCode: 400 };
  }

  const dummyConfig = bodyParams.dummyConfig || {};
  const showDebug = bodyParams.showDebug || false;

  const { actionType } = bodyParams;

  if (actionType == ACTION_TYPE_DICT.REC) {
    // Recommend
    const REC_SIZE = 30;
    const recListArgs = {
      formResponse: bodyParams.formResponse,
      isDummy: dummyConfig.all || dummyConfig.getRecList,
      size: REC_SIZE,
    };
    const recRes = await getRecList(recListArgs);
    if (recRes.isError) {
      const statusCode = recRes.statusCode || 500;
      return { body: recRes.errorObj, statusCode: statusCode };
    }
    const recList = recRes.recList;

    // Get images
    const NUM_RECS_WITH_IMAGES = 6;
    const recWithImageList = recList.slice(0, NUM_RECS_WITH_IMAGES);
    const getImagesArgs = {
      retrieveList: recWithImageList,
      isDummy: dummyConfig.all || dummyConfig.getImages,
    };
    const imageDict = await getImages(getImagesArgs);

    // Get affiliate link
    const getAmazonSearchLinksArgs = {
      recList,
      isDummy: dummyConfig.all || dummyConfig.getAmazonSearchLinks,
    };
    const amazonSearchLinkDict = getAmazonSearchLinks(getAmazonSearchLinksArgs);

    // Get final list to return
    const finalRecList = recList.map((rec) => {
      return {
        rec,
        imageUrl: imageDict[rec] || null,
        amazonSearchLink: amazonSearchLinkDict[rec] || null,
      };
    });

    const bodyToReturn = {
      recList: finalRecList,
    };

    if (showDebug) {
      bodyToReturn.usage = {
        oaiPromptTokens: recRes.promptTokens,
        oaiCompletionTokens: recRes.completionTokens,
      };
    }

    return {
      body: bodyToReturn,
      statusCode: 200,
    };
  }

  if (actionType == ACTION_TYPE_DICT.RETRIEVE_IMAGE) {
    const { retrieveImageForRecList } = bodyParams;
    const getImagesArgs = {
      retrieveList: retrieveImageForRecList,
      isDummy: dummyConfig.all || dummyConfig.getImages,
    };
    const imageDict = await getImages(getImagesArgs);

    return { body: imageDict, statusCode: 200 };
  }

  return { body: { error: "Invalid inputs" }, statusCode: 400 };
}
