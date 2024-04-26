import ACTION_TYPE_DICT from "../constants/actionTypeList.mjs";
import getAmazonSearchLinks from "./getAmazonSearchLinks.mjs";
import getImages from "./getImages.mjs";
import getRecList from "./getRecList.mjs";
import validateInputs from "./validateInputs.mjs";
import { googleProgProductSearch } from "./googleProgProductSearch.mjs";
import oxylabsProductSearch from "./oxylabsProductSearch.mjs";
import rainforestProductSearch from "./rainforestProductSearch.mjs";

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
    const REC_SIZE = 10;
    const recListArgs = {
      formResponse: bodyParams.formResponse,
      isDummy: dummyConfig.all || dummyConfig.getRecList,
      size: REC_SIZE,
      oldIdeaList: bodyParams.oldIdeaList || null,
    };
    const recRes = await getRecList(recListArgs);
    if (recRes.isError) {
      const statusCode = recRes.statusCode || 500;
      return { body: recRes.errorObj, statusCode: statusCode };
    }
    const recList = recRes.recList;

    // Get affiliate link
    const getAmazonSearchLinksArgs = {
      recList,
      isDummy: dummyConfig.all || dummyConfig.getAmazonSearchLinks,
    };
    const amazonSearchLinkDict = getAmazonSearchLinks(getAmazonSearchLinksArgs);

    // Get final list to return
    const finalRecList = recList.map((rec) => {
      return {
        idea: rec,
        amazonSearchLink: amazonSearchLinkDict[rec] || null,
      };
    });

    const bodyToReturn = {
      ideaList: finalRecList,
    };

    if (showDebug) {
      bodyToReturn.usage = {
        oaiPromptTokens: recRes.promptTokens,
        oaiCompletionTokens: recRes.completionTokens,
      };
      bodyToReturn.duration = {
        getRecListDuration: recRes.timeDiff,
      };
    }

    return {
      body: bodyToReturn,
      statusCode: 200,
    };
  }
  if (actionType == ACTION_TYPE_DICT.IMG) {
    const { retrieveImageList } = bodyParams;
    const NUM_IMAGES_PER_REC = 5;
    const getImagesArgs = {
      retrieveList: retrieveImageList,
      isDummy: dummyConfig.all || dummyConfig.getImages,
      numImagesPerRec: NUM_IMAGES_PER_REC,
    };
    const imgRes = await getImages(getImagesArgs);
    if (imgRes.isError) {
      return { body: "Failed to get images", statusCode: 500 };
    }
    const imageDict = imgRes.imageDict;

    const bodyToReturn = {
      imageDict,
    };

    if (showDebug) {
      bodyToReturn.duration = {
        getImagesDuration: imgRes.timeDiff,
      };
    }
    return { body: bodyToReturn, statusCode: 200 };
  }

  if (actionType == ACTION_TYPE_DICT.PS_OXYLABS) {
    const { inList } = bodyParams;
    const searchRes = await oxylabsProductSearch({
      retrieveList: inList,
      isDummy: dummyConfig.all || dummyConfig.getAmazonSearch,
    });
    if (searchRes.isError) {
      return { body: "Failed to search", statusCode: 500 };
    }
    const productDataDict = searchRes.productDataDict;

    const bodyToReturn = {
      productDataDict,
    };

    if (showDebug) {
      bodyToReturn.duration = {
        oxylabsProductSearch: searchRes.timeDiff,
      };
    }
    return { body: bodyToReturn, statusCode: 200 };
  }

  if (actionType == ACTION_TYPE_DICT.PS_RAINFOREST) {
    const { inList } = bodyParams;
    const searchRes = await rainforestProductSearch({
      retrieveList: inList,
      isDummy: dummyConfig.all || dummyConfig.rainforestSearch,
    });
    if (searchRes.isError) {
      return { body: "Failed to search", statusCode: 500 };
    }
    const productDataDict = searchRes.productDataDict;

    const bodyToReturn = {
      productDataDict,
    };

    if (showDebug) {
      bodyToReturn.duration = {
        rainforestProductSearch: searchRes.timeDiff,
      };
    }
    return { body: bodyToReturn, statusCode: 200 };
  }

  if (actionType == ACTION_TYPE_DICT.PS_GOOGLE_PROG) {
    const { inList } = bodyParams;
    const searchRes = await googleProgProductSearch({
      inList,
      isDummy: dummyConfig.all || dummyConfig.rainforestSearch,
    });
    if (searchRes.isError) {
      return { body: "Failed to search", statusCode: 500 };
    }
    const productDataDict = searchRes.productDataDict;

    const bodyToReturn = {
      productDataDict,
    };

    if (showDebug) {
      bodyToReturn.duration = {
        googleProgProductSearch: searchRes.timeDiff,
      };
    }
    return { body: bodyToReturn, statusCode: 200 };
  }

  return { body: { error: "Invalid inputs" }, statusCode: 400 };
}
