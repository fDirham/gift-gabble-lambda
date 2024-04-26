import { getTimeDifference, timeoutPromise } from "../utilities/helpers.mjs";

export default async function getImages(args) {
  const RETRIEVE_DELAY_MS = 500;

  const { isDummy, numImagesPerRec } = args;
  if (isDummy) {
    // TODO
    return { isError: false, imageDict: {}, timeDiff: 0 };
  }

  const startDate = new Date();

  const toReturn = {};

  let { retrieveList } = args;
  const MAX_RETRIEVE_SIZE = 6;
  if (retrieveList.length > MAX_RETRIEVE_SIZE) {
    retrieveList = retrieveList.slice(0, MAX_RETRIEVE_SIZE);
  }

  const imagesList = await Promise.all(
    retrieveList.map(async (kw, kwIdx) => {
      try {
        await timeoutPromise(kwIdx * RETRIEVE_DELAY_MS);

        const reqBody = {
          source: "google_search",
          domain: "com",
          query: kw + " site:amazon.com",
          parse: true,
        };

        const auth = {
          username: process.env.OXYLABS_USERNAME,
          password: process.env.OXYLABS_PASSWORD,
        };

        const reqHeaders = new Headers();
        reqHeaders.set(
          "Authorization",
          "Basic " +
            Buffer.from(auth.username + ":" + auth.password).toString("base64")
        );

        const res = await fetch("https://realtime.oxylabs.io/v1/queries", {
          method: "POST",
          body: JSON.stringify(reqBody),
          headers: reqHeaders,
        });

        const resData = await res.json();

        let imageList = resData.results[0].content.results.organic;
        const asinSet = new Set();
        const newImageList = [];
        imageList.forEach((imgObj) => {
          let linkUrl = imgObj.link;
          const DP_SUBSTR = "/dp/";
          const dpIdx = linkUrl.indexOf(DP_SUBSTR);
          if (dpIdx < 0) {
            return;
          }

          linkUrl = linkUrl.slice(dpIdx + DP_SUBSTR.length);

          const ampsIdx = linkUrl.indexOf("&");
          if (ampsIdx > 0) {
            linkUrl = linkUrl.slice(0, ampsIdx);
          }

          const asin = linkUrl;
          if (asinSet.has(asin)) return;

          newImageList.push(imgObj.image);
          asinSet.add(asin);
        });
        imageList = newImageList;
        if (imageList.length > numImagesPerRec)
          imageList = imageList.slice(0, numImagesPerRec);

        return {
          isError: false,
          kw,
          data: imageList,
        };
      } catch (error) {
        console.log(kw, error);
        return { isError: true, kw, error };
      }
    })
  );

  imagesList.forEach((obj) => {
    if (!obj.isError) {
      toReturn[obj.kw] = obj.data;
    }
  });

  const endDate = new Date();
  const timeDiff = getTimeDifference(startDate, endDate);
  return { isError: false, imageDict: toReturn, timeDiff };
}
