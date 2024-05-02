import {
  encodeObject,
  getTimeDifference,
  timeoutPromise,
} from "../../utilities/helpers.mjs";

export default async function googleProgImageSearch(args) {
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

        let data = itemsList.map((item) => {
          try {
            const { link } = item;

            if (!link) {
              throw "No image link";
            }

            return { isError: false, image: link };
          } catch {
            return {
              isError: true,
            };
          }
        });

        data = data.filter((obj) => !obj.isError);
        data = data.map((obj) => obj.image);

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

  return { isError: false, imageDict: toReturn, timeDiff };
}
