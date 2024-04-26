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

  const dataList = await Promise.all(
    args.inList.map(async (kw, kwIdx) => {
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

        let data = itemsList.map((item) => {
          try {
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
          } catch {
            return {
              isError: true,
            };
          }
        });

        data = data.filter((obj) => !obj.isError);

        return {
          isError: false,
          kw,
          data,
        };
      } catch (error) {
        return { isError: true, kw, errorObj: error };
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
