import {
  encodeObject,
  getTimeDifference,
  timeoutPromise,
} from "../../utilities/helpers.mjs";

export default async function rainforestAmazonProducts(args) {
  const RETRIEVE_DELAY_MS = 50;

  const { isDummy } = args;
  if (isDummy) {
    // TODO
    return null;
  }

  const startDate = new Date();

  const { inList } = args;
  const amazonDataList = await Promise.all(
    inList.map(async (amazonUrl, kwIdx) => {
      try {
        await timeoutPromise(kwIdx * RETRIEVE_DELAY_MS);

        const params = {
          api_key: process.env.RAINFOREST_API_KEY,
          type: "product",
          url: amazonUrl,
          language: "en_US",
          associate_id: "fbdlabs-20",
        };

        const res = await fetch(
          `https://api.rainforestapi.com/request?` + encodeObject(params),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const resObj = await res.json();
        const product = resObj.product;

        return {
          isError: false,
          amazonUrl,
          data: {
            title: product.title,
            asin: product.asin,
            link: product.link,
          },
        };
      } catch (error) {
        console.log(kw, error);
        return { isError: true, amazonUrl, error };
      }
    })
  );

  const toReturn = {};
  searchDataList.forEach((obj) => {
    if (!obj.isError) {
      const data = [];
      const asinSet = new Set();
      obj.data.forEach((product) => {
        const asin = product.asin;
        if (!asinSet.has(asin)) {
          data.push(product);
          asinSet.add(asin);
        }
      });
      toReturn[obj.kw] = obj.data;
    }
  });

  const endDate = new Date();
  const timeDiff = getTimeDifference(startDate, endDate);

  return { isError: false, searchDataDict: toReturn, timeDiff };
}
