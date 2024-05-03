import {
  encodeObject,
  getTimeDifference,
  timeoutPromise,
} from "../../utilities/helpers.mjs";

export default async function googleProgProductSearch(args) {
  if (args.isDummy) {
    // TODO
    return { isError: false, dataDict: {}, timeDiff: 0 };
  }

  const RETRIEVE_DELAY_MS = 50;
  const startDate = new Date();

  let dataList = await Promise.all(
    args.inList.map(async (kw, kwIdx) => {
      try {
        // Break down keywords
        const tmpKw = kw.split(" ").slice(0, 4).join(" ");

        await timeoutPromise(kwIdx * RETRIEVE_DELAY_MS);

        const params = {
          key: process.env.GOOGLE_PROG_SEARCH_KEY,
          cx: process.env.GOOGLE_PROG_SEARCH_ENGINE_ID,
          q: tmpKw + " inurl:amazon",
          searchType: "image",
        };

        const res = await fetch(
          "https://www.googleapis.com/customsearch/v1?" + encodeObject(params),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const resObj = await res.json();
        const itemsList = resObj.items;

        let resList = itemsList.map((item) => {
          try {
            const { link, image, title } = item;

            const toAdd = {
              imageUrl: link,
              amazonUrl: image.contextLink,
              title,
            };

            if (!toAdd.amazonUrl.includes("/dp")) {
              throw "No DP";
            }

            return { isError: false, data: toAdd };
          } catch {
            return {
              isError: true,
            };
          }
        });

        resList = resList.filter((obj) => !obj.isError);

        const asinSet = new Set();
        const newList = [];

        for (let resIdx = 0; resIdx < resList.length; resIdx++) {
          const resObj = resList[resIdx];
          const { amazonUrl } = resObj.data;
          const dpStr = "/dp/";
          const dpIdx = amazonUrl.indexOf(dpStr);
          const asin = amazonUrl.slice(dpIdx + dpStr.length);
          if (asinSet.has(asin)) continue;

          // Add tag to amazonUrl
          let newAmazonUrl = resObj.data.amazonUrl;
          if (newAmazonUrl.includes("?")) newAmazonUrl += "&";
          else newAmazonUrl += "?";
          newAmazonUrl += "tag=fbdlabs-20";

          resObj.data.amazonUrl += newAmazonUrl;

          // Clean title
          let newTitle = resObj.data.title;
          newTitle = newTitle.replace("Amazon.com:", "");
          newTitle = newTitle.replace("Amazon.com -", "");
          newTitle = newTitle.replace("Amazon.com", "");
          resObj.data.title = newTitle;

          asinSet.add(asin);
          newList.push(resObj.data);
        }

        resList = newList;

        return {
          isError: false,
          kw,
          resList,
        };
      } catch (error) {
        return { isError: true, kw, errorObj: error };
      }
    })
  );

  const toReturn = {};
  dataList.forEach((obj) => {
    if (!obj.isError) {
      toReturn[obj.kw] = obj.resList;
    }
  });

  const endDate = new Date();
  const timeDiff = getTimeDifference(startDate, endDate);

  return { isError: false, productDataDict: toReturn, timeDiff };
}
