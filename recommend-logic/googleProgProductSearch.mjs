import {
  encodeObject,
  getTimeDifference,
  timeoutPromise,
} from "../utilities/helpers.mjs";

export async function googleProgProductSearch(args) {
  const { isDummy } = args;
  if (isDummy) {
    // TODO
    return { isError: false, dataDict: {}, timeDiff: 0 };
  }

  let { inList } = args;

  const RETRIEVE_DELAY_MS = 0;
  const startDate = new Date();

  const MAX_RETRIEVE_SIZE = 6;
  if (inList.length > MAX_RETRIEVE_SIZE) {
    inList = inList.slice(0, MAX_RETRIEVE_SIZE);
  }

  const dataList = await Promise.all(
    inList.map(async (kw, kwIdx) => {
      try {
        await timeoutPromise(kwIdx * RETRIEVE_DELAY_MS);

        const params = {
          key: process.env.GOOGLE_PROG_SEARCH_KEY,
          cx: process.env.GOOGLE_PROG_SEARCH_ENGINE_ID,
          q: kw,
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

        const data = itemsList.map((item) => {
          const { link, pagemap } = item;
          if (!link.includes("/dp/")) {
            throw "Not DP";
          }

          const { metatags } = pagemap;
          if (!metatags) {
            throw "No metatags";
          }

          const metaEl = metatags[0];

          const image = metaEl["og:image"];
          const title = metaEl["og:title"];

          return { link, image, title };
        });

        return {
          isError: false,
          kw,
          data,
        };
      } catch (error) {
        return { isError: true, kw, error };
      }
    })
  );

  const toReturn = {};
  dataList.forEach((obj) => {
    if (!obj.isError) {
      toReturn[obj.kw] = obj.data;
    }
  });

  const endDate = new Date();
  const timeDiff = getTimeDifference(startDate, endDate);

  return { isError: false, productDataDict: toReturn, timeDiff };
}
